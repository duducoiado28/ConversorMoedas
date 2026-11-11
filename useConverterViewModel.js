import { useCallback, useEffect, useRef, useState } from 'react';
import { getCurrencies, getRate, ApiError } from '../models/currencyModel';

export function parseAmount(text) {
  const t = String(text ?? '').trim();
  if (t === '') return { error: 'Digite o valor que deseja converter.' };
  if (!/^\d+([.,]\d+)?$/.test(t)) {
    return { error: 'Use apenas números, com no máximo uma vírgula ou ponto decimal (ex.: 10,50).' };
  }
  const value = Number(t.replace(',', '.'));
  if (!Number.isFinite(value) || value <= 0) {
    return { error: 'O valor deve ser maior que zero.' };
  }
  return { value };
}

function formatMoney(value, code) {
  try {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: code });
  } catch {
    return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${code}`;
  }
}
const formatRate = (r) => r.toLocaleString('pt-BR', { maximumFractionDigits: 6 });
const formatDate = (iso) => {
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
};

export function useConverterViewModel() {
  const [amountText, setAmountText] = useState('');
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [currenciesError, setCurrenciesError] = useState(null);
  const [converting, setConverting] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [result, setResult] = useState(null);

  const requestId = useRef(0);
  const abortRef = useRef(null);

  const loadCurrencies = useCallback(async () => {
    setLoadingCurrencies(true);
    setCurrenciesError(null);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const list = await getCurrencies(controller.signal);
      setCurrencies(list);
      const codes = list.map((c) => c.code);
      setFrom((cur) => cur ?? (codes.includes('USD') ? 'USD' : codes[0]));
      setTo((cur) => cur ?? (codes.includes('BRL') ? 'BRL' : codes[1] ?? codes[0]));
    } catch (e) {
      if (e?.name === 'AbortError') return;
      setCurrenciesError(
        e instanceof ApiError ? e.message : 'Não foi possível carregar as moedas.'
      );
    } finally {
      setLoadingCurrencies(false);
    }
  }, []);

  useEffect(() => {
    loadCurrencies();
    return () => abortRef.current?.abort();
  }, [loadCurrencies]);

  const resetFeedback = () => {
    requestId.current += 1;
    setConverting(false);
    setResult(null);
    setValidationError(null);
    setApiError(null);
  };
  const changeAmount = (t) => { setAmountText(t); resetFeedback(); };
  const changeFrom = (c) => { setFrom(c); resetFeedback(); };
  const changeTo = (c) => { setTo(c); resetFeedback(); };
  const swapCurrencies = () => {
    setFrom(to);
    setTo(from);
    resetFeedback();
  };

  const convert = useCallback(async () => {
    if (converting) return;
    setValidationError(null);
    setApiError(null);
    setResult(null);

    const parsed = parseAmount(amountText);
    if (parsed.error) return setValidationError(parsed.error);
    if (!from) return setValidationError('Selecione a moeda de origem.');
    if (!to) return setValidationError('Selecione a moeda de destino.');
    if (from === to) return setValidationError('Escolha moedas diferentes para a conversão.');

    const id = ++requestId.current;
    const controller = new AbortController();
    abortRef.current = controller;
    setConverting(true);
    try {
      const data = await getRate(from, to, controller.signal);
      if (id !== requestId.current) return;
      const converted = parsed.value * data.rate;
      setResult({
        amount: formatMoney(parsed.value, from),
        converted: formatMoney(converted, to),
        rate: `1 ${from} = ${formatRate(data.rate)} ${to}`,
        date: formatDate(data.date),
      });
    } catch (e) {
      if (e?.name === 'AbortError' || id !== requestId.current) return;
      setApiError(
        e instanceof ApiError
          ? e.message
          : 'Não foi possível obter a taxa de câmbio. Tente novamente.'
      );
    } finally {
      if (id === requestId.current) setConverting(false);
    }
  }, [amountText, from, to, converting]);

  return {
    amountText, from, to, currencies,
    loadingCurrencies, currenciesError, converting,
    validationError, apiError, result,
    changeAmount, changeFrom, changeTo, swapCurrencies,
    convert, reloadCurrencies: loadCurrencies,
  };
}