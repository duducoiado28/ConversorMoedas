# Conversor de Moedas

Aplicativo mobile de conversão de moedas feito com React Native (Expo), JavaScript e arquitetura MVVM. Os dados vêm da API pública Frankfurter (https://api.frankfurter.dev/v2).

## Como instalar e executar

1. Instale o Node.js e clone este repositório.
2. Na pasta do projeto, rode:

```bash
npm install
npx expo install @react-native-picker/picker
npx expo start
```

3. Abra no Expo Go (celular) ou em um emulador.

## Arquitetura MVVM

- `src/models/currencyModel.js`: acesso à API (lista de moedas e taxa de câmbio).
- `src/viewmodels/useConverterViewModel.js`: estados, validações e cálculo da conversão.
- `src/views/ConverterScreen.js`: tela do aplicativo.
- `App.js`: ponto de entrada.

## Funcionalidades

- Lista de moedas carregada da API.
- Validação do valor (vazio, zero, negativo, decimal com vírgula ou ponto).
- Exibição da taxa e da data de referência retornadas pela API.
- Tratamento de carregamento e de erros, com opção de tentar novamente.
- Botão para inverter as moedas.

## Capturas de tela

![Tela inicial](screenshots/tela-inicial.png)
![Conversão válida](screenshots/conversao.png)
![Erro de validação](screenshots/erro-validacao.png)
![Valor decimal](screenshots/valor-decimal.png)
