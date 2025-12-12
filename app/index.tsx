import { View, Text, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const CARDS = [
  { id: '1', name: 'Auchan', color: 'bg-red-500' },
  { id: '2', name: 'Carrefour', color: 'bg-blue-600' },
  { id: '3', name: 'Fnac', color: 'bg-yellow-500' },
  { id: '4', name: 'IKEA', color: 'bg-blue-800' },
  { id: '5', name: 'Decathlon', color: 'bg-blue-400' },
  { id: '6', name: 'Leroy Merlin', color: 'bg-green-600' },
];

export default function Index() {
  const insets = useSafeAreaInsets();
  
  return (
    <View className="flex-1 bg-gray-50 px-4" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />
      <FlatList
        ListHeaderComponent={
          <View className="flex-row items-center mb-6 mt-2">
            <Ionicons name="card" size={32} color="#333" />
            <Text className="text-3xl font-bold ml-3 text-gray-800">Mes Cartes</Text>
          </View>
        }
        data={CARDS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <View className={`${item.color} w-[48%] h-32 rounded-xl p-4 justify-between mb-4 shadow-sm`}>
            <View className="self-end bg-white/20 p-1 rounded">
              <Ionicons name="qr-code" size={20} color="white" />
            </View>
            <Text className="text-white font-bold text-lg">{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}
