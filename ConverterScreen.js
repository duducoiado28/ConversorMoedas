import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useConverterViewModel } from '../viewmodels/useConverterViewModel';

function CurrencyPicker({ label, value, onChange, currencies, disabled }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={value}
          onValueChange={onChange}
          enabled={!disabled}
          accessibilityLabel={label}
        >
          {currencies.map((c) => (
            <Picker.Item key={c.code} label={`${c.code} — ${c.name}`} value={c.code} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

export default function ConverterScreen() {
  const vm = useConverterViewModel();
  const pickersDisabled = vm.loadingCurrencies || !!vm.currenciesError || vm.converting;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Conversor de Moedas</Text>

        {vm.loadingCurrencies && (
          <View style={styles.row}>
            <ActivityIndicator />
            <Text style={styles.muted}>  Carregando moedas…</Text>
          </View>
        )}

        {vm.currenciesError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{vm.currenciesError}</Text>
            <Pressable onPress={vm.reloadCurrencies} style={styles.linkBtn}>
              <Text style={styles.linkText}>Tentar novamente</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Valor</Text>
          <TextInput
            style={styles.input}
            value={vm.amountText}
            onChangeText={vm.changeAmount}
            keyboardType="decimal-pad"
            placeholder="0,00"
            editable={!vm.converting}
          />
        </View>

        <CurrencyPicker label="De" value={vm.from} onChange={vm.changeFrom}
          currencies={vm.currencies} disabled={pickersDisabled} />

        <Pressable onPress={vm.swapCurrencies} disabled={pickersDisabled}
          style={[styles.swapBtn, pickersDisabled && styles.disabled]}>
          <Text style={styles.swapText}>⇅ Inverter moedas</Text>
        </Pressable>

        <CurrencyPicker label="Para" value={vm.to} onChange={vm.changeTo}
          currencies={vm.currencies} disabled={pickersDisabled} />

        <Pressable
          onPress={vm.convert}
          disabled={vm.converting || pickersDisabled}
          style={[styles.button, (vm.converting || pickersDisabled) && styles.disabled]}
        >
          {vm.converting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Converter</Text>}
        </Pressable>

        {vm.validationError && (
          <View style={styles.warnBox}><Text style={styles.warnText}>{vm.validationError}</Text></View>
        )}

        {vm.apiError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{vm.apiError}</Text>
            <Pressable onPress={vm.convert} style={styles.linkBtn}>
              <Text style={styles.linkText}>Tentar novamente</Text>
            </Pressable>
          </View>
        )}

        {vm.result && (
          <View style={styles.resultBox}>
            <Text style={styles.muted}>{vm.result.amount} equivalem a</Text>
            <Text style={styles.resultValue}>{vm.result.converted}</Text>
            <Text style={styles.detail}>Taxa: {vm.result.rate}</Text>
            <Text style={styles.detail}>Data de referência: {vm.result.date}</Text>
            <Text style={styles.disclaimer}>
              Taxa de referência informada pela API Frankfurter; não é uma cotação comercial em tempo real.
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '700', color: '#1b2a4a', marginBottom: 20, textAlign: 'center' },
  field: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '600', color: '#44506b', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d5dbe8', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 18 },
  pickerBox: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d5dbe8', borderRadius: 10, overflow: 'hidden' },
  swapBtn: { alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 14, marginBottom: 8 },
  swapText: { color: '#2f5bea', fontWeight: '600' },
  button: { backgroundColor: '#2f5bea', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  disabled: { opacity: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  muted: { color: '#667089', fontSize: 14 },
  warnBox: { backgroundColor: '#fff6e0', borderRadius: 10, padding: 12, marginTop: 14 },
  warnText: { color: '#7a5a00' },
  errorBox: { backgroundColor: '#fde8e8', borderRadius: 10, padding: 12, marginTop: 14, marginBottom: 6 },
  errorText: { color: '#a12626' },
  linkBtn: { marginTop: 8 },
  linkText: { color: '#2f5bea', fontWeight: '700' },
  resultBox: { backgroundColor: '#fff', borderRadius: 12, padding: 18, marginTop: 18,
    borderWidth: 1, borderColor: '#e1e6f2', alignItems: 'center' },
  resultValue: { fontSize: 30, fontWeight: '800', color: '#1b2a4a', marginVertical: 8 },
  detail: { color: '#44506b', marginTop: 2 },
  disclaimer: { color: '#8a93a8', fontSize: 12, marginTop: 12, textAlign: 'center' },
});