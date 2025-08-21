// mobile/src/screens/AssetsScreen.tsx
// Assets screen component

import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  Searchbar,
  Chip,
  ActivityIndicator,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api } from "@/services/api";
import { Asset } from "@/types";

export default function AssetsScreen() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const router = useRouter();
  const { userId } = useLocalSearchParams();

  const loadAssets = async () => {
    try {
      const params: any = {};
      if (userId) params.userId = userId;
      if (selectedState) params.state = selectedState;
      if (selectedType) params.type = selectedType;
      if (searchQuery) params.search = searchQuery;

      const response = await api.get("/assets", { params });
      setAssets(response.data);
    } catch (error) {
      console.error("Failed to load assets:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAssets();
    setRefreshing(false);
  };

  useEffect(() => {
    loadAssets();
  }, [userId, selectedState, selectedType, searchQuery]);

  const handleAssetPress = (asset: Asset) => {
    router.push(`/asset/${asset.assetNumber}`);
  };

  const handleAddAsset = () => {
    router.push("/assets/new");
  };

  const renderAssetCard = ({ item }: { item: Asset }) => (
    <Card style={styles.assetCard} onPress={() => handleAssetPress(item)}>
      <Card.Content>
        <Title style={styles.assetNumber}>{item.assetNumber}</Title>
        <Paragraph style={styles.assetDescription}>
          {item.description}
        </Paragraph>
        <View style={styles.assetDetails}>
          <Paragraph style={styles.assetStatus}>
            Status: {item.status}
          </Paragraph>
          <Paragraph style={styles.assetType}>Type: {item.type}</Paragraph>
        </View>
      </Card.Content>
    </Card>
  );

  const renderFilterChips = () => (
    <View style={styles.filterContainer}>
      <Chip
        selected={selectedState === ""}
        onPress={() => setSelectedState("")}
        style={styles.filterChip}
      >
        All States
      </Chip>
      <Chip
        selected={selectedState === "AVAILABLE"}
        onPress={() => setSelectedState("AVAILABLE")}
        style={styles.filterChip}
      >
        Available
      </Chip>
      <Chip
        selected={selectedState === "ASSIGNED"}
        onPress={() => setSelectedState("ASSIGNED")}
        style={styles.filterChip}
      >
        Assigned
      </Chip>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1d4ed8" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Assets</Title>
        <Button mode="contained" onPress={handleAddAsset}>
          Add Asset
        </Button>
      </View>

      <Searchbar
        placeholder="Search assets..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {renderFilterChips()}

      <FlatList
        data={assets}
        renderItem={renderAssetCard}
        keyExtractor={(item) => item.id}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Paragraph style={styles.emptyText}>No assets found</Paragraph>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1d4ed8",
  },
  searchBar: {
    margin: 16,
    marginTop: 0,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  list: {
    flex: 1,
  },
  assetCard: {
    margin: 16,
    marginTop: 0,
  },
  assetNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  assetDescription: {
    marginTop: 4,
    color: "#666",
  },
  assetDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  assetStatus: {
    fontSize: 12,
    color: "#888",
  },
  assetType: {
    fontSize: 12,
    color: "#888",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  },
}); 