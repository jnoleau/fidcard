import { View, Text, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useCardStore } from '../store/useCardStore';

export default function Index() {
  const insets = useSafeAreaInsets();
  const cards = useCardStore((state) => state.cards);
  
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
        data={cards}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <View 
            className="w-[48%] h-32 rounded-xl p-4 justify-between mb-4 shadow-sm"
            style={{ backgroundColor: item.color }}
          >
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
