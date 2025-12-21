import { View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCardStore } from '../../store/useCardStore';
import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

export default function EditCard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cards, updateCard } = useCardStore();
  
  const card = cards.find((c) => c.id === id);
  
  const [name, setName] = useState(card?.name || '');
  const [color, setColor] = useState(card?.color || '');
  const [value, setValue] = useState(card?.value || '');

  useEffect(() => {
    if (card) {
      setName(card.name);
      setColor(card.color);
      setValue(card.value);
    }
  }, [card]);

  if (!card) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Carte non trouvée</Text>
      </View>
    );
  }

  const handleSave = () => {
    updateCard(card.id, { name, color, value });
    router.back();
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />
      <View className="px-4 py-4 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Modifier la carte</Text>
        <TouchableOpacity onPress={handleSave} className="bg-blue-600 px-4 py-2 rounded-lg">
          <Text className="text-white font-bold">Enregistrer</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24, paddingBottom: 40 }}
        bottomOffset={20}
      >
        <View className="mb-8 items-center">
          <View 
            className="w-64 h-40 rounded-2xl p-6 justify-between shadow-lg"
            style={{ backgroundColor: color || '#ccc' }}
          >
            <View className="self-end bg-white/20 p-2 rounded-lg">
              <Ionicons name="qr-code" size={32} color="white" />
            </View>
            <Text className="text-white font-bold text-2xl">{name || '...'}</Text>
          </View>
        </View>

        <View className='space-y-6'>
          <View>
            <Text className="text-sm font-medium text-gray-500 mb-2 ml-1">Nom de l'enseigne</Text>
            <TextInput
              className="bg-gray-50 p-4 rounded-lg border border-gray-100 "
              value={name}
              onChangeText={setName}
              placeholder="Ex: Auchan, Fnac..."
            />
          </View>

          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-500 mb-2 ml-1">Couleur (Hexadécimal)</Text>
            <TextInput
              className="bg-gray-50 p-4 rounded-lg border border-gray-100"
              value={color}
              onChangeText={setColor}
              placeholder="#000000"
              autoCapitalize="none"
            />
          </View>

          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-500 mb-2 ml-1">Valeur (Code barre / QR Code)</Text>
            <TextInput
              className="bg-gray-50 p-4 rounded-lg border border-gray-100"
              value={value}
              onChangeText={setValue}
              placeholder="Numéro de la carte..."
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
