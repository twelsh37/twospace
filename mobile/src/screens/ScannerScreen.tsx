// mobile/src/screens/ScannerScreen.tsx
// Scanner screen component

import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Button, Title, Paragraph, Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarCodeScanner } from "expo-barcode-scanner";
import { useRouter } from "expo-router";
import { api } from "@/services/api";

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);
    setScanning(false);

    try {
      // Validate the scanned data
      if (!data || data.trim().length === 0) {
        Alert.alert("Invalid Code", "The scanned code appears to be invalid.");
        return;
      }

      // Try to find the asset
      const response = await api.get(`/assets/${data.trim()}`);
      const asset = response.data;

      Alert.alert(
        "Asset Found",
        `Asset: ${asset.assetNumber}\nDescription: ${asset.description}\nStatus: ${asset.status}`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "View Details",
            onPress: () => router.push(`/asset/${asset.assetNumber}`),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Asset Not Found", `No asset found with number: ${data}`, [
        { text: "Scan Again", onPress: () => setScanned(false) },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const startScanning = () => {
    setScanning(true);
    setScanned(false);
  };

  const stopScanning = () => {
    setScanning(false);
    setScanned(false);
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Title>Requesting camera permission...</Title>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Title>No access to camera</Title>
          <Paragraph style={styles.permissionText}>
            Camera access is required to scan barcodes and QR codes.
          </Paragraph>
          <Button mode="contained" onPress={() => router.back()}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {scanning ? (
        <View style={styles.scannerContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
            <Title style={styles.scanText}>Position barcode within frame</Title>
          </View>
          <View style={styles.buttonContainer}>
            <Button mode="contained" onPress={stopScanning}>
              Stop Scanning
            </Button>
          </View>
        </View>
      ) : (
        <View style={styles.centerContainer}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>Asset Scanner</Title>
              <Paragraph style={styles.description}>
                Scan barcodes or QR codes to quickly find and manage assets.
              </Paragraph>
              <Button
                mode="contained"
                onPress={startScanning}
                style={styles.button}
              >
                Start Scanning
              </Button>
            </Card.Content>
          </Card>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  scannerContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "transparent",
  },
  scanText: {
    color: "#fff",
    marginTop: 20,
    textAlign: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 400,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
    color: "#1d4ed8",
  },
  description: {
    textAlign: "center",
    marginBottom: 24,
    color: "#666",
  },
  button: {
    backgroundColor: "#1d4ed8",
  },
  permissionText: {
    textAlign: "center",
    marginVertical: 16,
    color: "#666",
  },
}); 