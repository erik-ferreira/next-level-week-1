import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native'
import { Feather as Icon } from '@expo/vector-icons'
import MapView, { Marker } from 'react-native-maps'
import { SvgUri } from 'react-native-svg'
import { useNavigation, useRoute } from '@react-navigation/native'
import * as Location from 'expo-location'

import api from '../../services/api'
import styles from './style'

interface ItemProps {
  id: number;
  title: string;
  image_url: string;
}

interface PointsProps {
  id: number;
  name: string;
  image: string;
  image_url: string;
  latitude: number;
  longitude: number;
}

interface RouteParams {
  selectedUf: string;
  selectedCity: string;
}

const Points = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { selectedUf, selectedCity } = route.params as RouteParams

  const [items, setItems] = useState<ItemProps[]>([])
  const [points, setPoints] = useState<PointsProps[]>([])
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0])

  
  useEffect(() => {
    api.get('/items').then(response => {
      setItems(response.data)
    })
  }, [])

  useEffect(() => {
    async function loadPosition() {
      const { status } = await Location.requestPermissionsAsync()

      if(status !== 'granted') {
        Alert.alert('Opsss...', 'Precisamos da sua permissão para obter a localização')
        return
      }

      const location = await Location.getCurrentPositionAsync()
      const { latitude, longitude } = location.coords
      setInitialPosition([latitude, longitude])
    }

    loadPosition()
  }, [])

  useEffect(() => {
    console.log(selectedCity, selectedUf);

    api.get('/points', {
      params: {
        city: selectedCity,
        uf: selectedUf,
        items: selectedItems
      }
    }).then(response => {
      setPoints(response.data)
    })
  }, [selectedItems])
  
  function handleNavigateBack() {
    navigation.goBack()
  }

  function handleNavigateToDetail(id: number) {
    navigation.navigate('Detail', { point_id: id })
  }

  function handleSelectedItem(id: number) {
    const alreadySelected = selectedItems.findIndex(item => item === id)

    if(alreadySelected >= 0) {
      const filteredItems = selectedItems.filter(item => item !== id)

      setSelectedItems(filteredItems)
    } else {
      setSelectedItems([ ...selectedItems, id ])
    }
  }

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name="arrow-left" size={24} color="#34cb79" />
        </TouchableOpacity>

        <Text style={styles.title}>Bem-vindo.</Text>
        <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

        <View style={styles.mapContainer}>
          { initialPosition[0] !== 0 && (
            <MapView  
              style={styles.map}
              initialRegion={{
                latitude: initialPosition[0],
                longitude: initialPosition[1],
                latitudeDelta: 0.014,
                longitudeDelta: 0.014
              }}
            >
              {points.map(point => (
                <Marker
                  key={String(point.id)}
                  style={styles.mapMarker}
                  onPress={() => handleNavigateToDetail(point.id)}
                  coordinate={{
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }}
                >
                  <View style={styles.mapMarkerContainer}>
                    <Image 
                      source={{ uri: point.image_url }}
                      style={styles.mapMarkerImage}
                    />
                    <Text style={styles.mapMarkerTitle}> {point.name} </Text>
                  </View>
                </Marker>
              ))}
            </MapView>
          )}
        </View>
      </View>

      <View style={styles.itemsContainer}>
        <ScrollView
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {items.map(item => (
            <TouchableOpacity 
              key={String(item.id)} 
              style={[
                styles.item,
                selectedItems.includes(item.id) ? styles.selectedItem : {}
              ]}
              onPress={() => handleSelectedItem(item.id)}
              activeOpacity={0.6}
            >
              <SvgUri width={42} height={42} uri={item.image_url} />
              <Text  style={styles.itemTitle}> {item.title} </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  )
}

export default Points