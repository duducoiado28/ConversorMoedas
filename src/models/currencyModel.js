const BASE_URL = 'https://api.frankfurter.dev/v2';

export class ApiError extends Error {
  constructor(type, message, status) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
  }
}

async function request(path, signal) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { signal });
  } catch (e) {
    if (e?.name === 'AbortError') throw e;
    throw new ApiError('network', 'Falha de conexão com o serviço de câmbio.');
  }

  let data = null;
  try {
    data = await response.json();
  } catch {}

  if (!response.ok) {
    throw new ApiError(
      'http',
      data?.message || `O serviço respondeu com erro (HTTP ${response.status}).`,
      response.status
    );
  }
  if (data === null || typeof data !== 'object') {
    throw new ApiError('invalid', 'Resposta inesperada do serviço de câmbio.');
  }
  return data;
}

export async function getCurrencies(signal) {
  const data = await request('/currencies', signal);
  if (!Array.isArray(data)) {
    throw new ApiError('invalid', 'Lista de moedas em formato inesperado.');
  }
  const list = data
    .filter((c) => c.type === 'currency' && c.iso_code && c.name)
    .map((c) => ({ code: c.iso_code, name: c.name }))
    .sort((a, b) => a.code.localeCompare(b.code));

  if (list.length === 0) {
    throw new ApiError('invalid', 'Nenhuma moeda retornada pelo serviço.');
  }
  return list;
}

export async function getRate(base, quote, signal) {
  const data = await request(
    `/rate/${encodeURIComponent(base)}/${encodeURIComponent(quote)}`,
    signal
  );
  if (typeof data.rate !== 'number' || !(data.rate > 0) || typeof data.date !== 'string') {
    throw new ApiError('invalid', 'A taxa de câmbio não veio no formato esperado.');
  }
  return { base: data.base, quote: data.quote, rate: data.rate, date: data.date };
}
