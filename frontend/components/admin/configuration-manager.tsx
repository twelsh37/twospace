// frontend/components/admin/configuration-manager.tsx

/*
MIT License

Copyright (c) 2025 Tom Welsh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getTenantConfig,
  getAssetLabelTemplate,
  getCustomAssetTypes,
  getCustomAssetStates,
  updateTenantConfig,
  updateAssetLabelTemplate,
  type AssetLabelTemplateConfig,
} from "@/app/admin/configuration/actions";

/**
 * Configuration Manager Component
 *
 * This component provides a comprehensive interface for managing tenant-specific
 * configurations including asset label templates, state transitions, and business rules.
 * It's designed to be used by administrators to customize the system for their organization.
 */

interface ConfigurationManagerProps {
  tenantId: string;
}

export function ConfigurationManager({ tenantId }: ConfigurationManagerProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Original configuration state (for comparison)
  const [originalConfig, setOriginalConfig] = useState({
    companyName: "",
    companyPrefix: "",
    primaryColor: "#3B82F6",
    secondaryColor: "#1E40AF",
  });

  // General configuration state
  const [companyName, setCompanyName] = useState("");
  const [companyPrefix, setCompanyPrefix] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [secondaryColor, setSecondaryColor] = useState("#1E40AF");

  // Asset label template state
  const [labelTemplate, setLabelTemplate] = useState<AssetLabelTemplateConfig>({
    companyPrefix: "",
    assetTypeCode: "",
    assetNumber: "",
    separator: "-",
    format: "{prefix}-{type}-{number}",
  });

  // Asset types state
  const [assetTypes, setAssetTypes] = useState<
    Array<{
      typeCode: string;
      typeName: string;
      category: string;
      iconName: string;
    }>
  >([]);

  // Asset states state
  const [assetStates, setAssetStates] = useState<
    Array<{
      stateCode: string;
      stateName: string;
      stateColor: string;
      stateOrder: number;
      isStartState: boolean;
      isEndState: boolean;
    }>
  >([]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    return (
      companyName !== originalConfig.companyName ||
      companyPrefix !== originalConfig.companyPrefix ||
      primaryColor !== originalConfig.primaryColor ||
      secondaryColor !== originalConfig.secondaryColor
    );
  }, [
    companyName,
    companyPrefix,
    primaryColor,
    secondaryColor,
    originalConfig,
  ]);

  // Navigation warning effect
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    const handleRouteChange = () => {
      if (hasUnsavedChanges()) {
        const confirmed = window.confirm(
          "You have unsaved changes. Are you sure you want to leave? Any unsaved changes will be lost."
        );
        if (!confirmed) {
          // Prevent navigation
          throw new Error("Navigation cancelled by user");
        }
      }
    };

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, [hasUnsavedChanges]);

  /**
   * Show message to user
   */
  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  /**
   * Load all configuration data for the tenant
   */
  const loadConfiguration = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load tenant configuration
      const tenantConfig = await getTenantConfig(tenantId);
      if (tenantConfig.success && tenantConfig.data) {
        setCompanyName(tenantConfig.data.companyName);
        setCompanyPrefix(tenantConfig.data.companyPrefix);
        setPrimaryColor(tenantConfig.data.primaryColor || "#3B82F6");
        setSecondaryColor(tenantConfig.data.secondaryColor || "#1E40AF");

        // Store original values for comparison
        setOriginalConfig({
          companyName: tenantConfig.data.companyName,
          companyPrefix: tenantConfig.data.companyPrefix,
          primaryColor: tenantConfig.data.primaryColor || "#3B82F6",
          secondaryColor: tenantConfig.data.secondaryColor || "#1E40AF",
        });
      }

      // Load asset label template
      const template = await getAssetLabelTemplate(tenantId);
      if (template.success && template.data) {
        setLabelTemplate(template.data.template as AssetLabelTemplateConfig);
      }

      // Load custom asset types
      const types = await getCustomAssetTypes(tenantId);
      if (types.success && types.data && types.data.length > 0) {
        setAssetTypes(
          types.data.map((t) => ({
            typeCode: t.typeCode,
            typeName: t.typeName,
            category: t.category || "",
            iconName: t.iconName || "",
          }))
        );
      }

      // Load custom asset states
      const states = await getCustomAssetStates(tenantId);
      if (states.success && states.data && states.data.length > 0) {
        setAssetStates(
          states.data.map((s) => ({
            stateCode: s.stateCode,
            stateName: s.stateName,
            stateColor: s.stateColor,
            stateOrder: s.stateOrder,
            isStartState: s.isStartState,
            isEndState: s.isEndState,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading configuration:", error);
      showMessage("error", "Failed to load configuration");
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  // Load configuration on component mount
  useEffect(() => {
    loadConfiguration();
  }, [tenantId, loadConfiguration]);

  /**
   * Save general tenant configuration
   */
  const saveGeneralConfig = async () => {
    try {
      setIsLoading(true);

      const result = await updateTenantConfig(tenantId, {
        companyName,
        companyPrefix,
        primaryColor,
        secondaryColor,
      });

      if (result.success) {
        // Update original config after successful save
        setOriginalConfig({
          companyName,
          companyPrefix,
          primaryColor,
          secondaryColor,
        });

        // Update label template with new company prefix
        setLabelTemplate((prev) => ({
          ...prev,
          companyPrefix: companyPrefix,
        }));

        showMessage("success", "General configuration saved successfully");
      } else {
        showMessage("error", result.error || "Failed to save configuration");
      }
    } catch (error) {
      console.error("Error saving general config:", error);
      showMessage("error", "Failed to save general configuration");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save asset label template
   */
  const saveLabelTemplate = async () => {
    try {
      setIsLoading(true);

      const result = await updateAssetLabelTemplate(tenantId, labelTemplate);

      if (result.success) {
        showMessage("success", "Asset label template saved successfully");
      } else {
        showMessage("error", result.error || "Failed to save template");
      }
    } catch (error) {
      console.error("Error saving label template:", error);
      showMessage("error", "Failed to save asset label template");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Add new asset type
   */
  const addAssetType = () => {
    setAssetTypes([
      ...assetTypes,
      {
        typeCode: "",
        typeName: "",
        category: "",
        iconName: "",
      },
    ]);
  };

  /**
   * Remove asset type
   */
  const removeAssetType = (index: number) => {
    setAssetTypes(assetTypes.filter((_, i) => i !== index));
  };

  /**
   * Update asset type
   */
  const updateAssetType = (index: number, field: string, value: string) => {
    const updated = [...assetTypes];
    updated[index] = { ...updated[index], [field]: value };
    setAssetTypes(updated);
  };

  /**
   * Add new asset state
   */
  const addAssetState = () => {
    setAssetStates([
      ...assetStates,
      {
        stateCode: "",
        stateName: "",
        stateColor: "#3B82F6",
        stateOrder: assetStates.length + 1,
        isStartState: false,
        isEndState: false,
      },
    ]);
  };

  /**
   * Remove asset state
   */
  const removeAssetState = (index: number) => {
    setAssetStates(assetStates.filter((_, i) => i !== index));
  };

  /**
   * Update asset state
   */
  const updateAssetState = (
    index: number,
    field: string,
    value: string | number | boolean
  ) => {
    const updated = [...assetStates];
    updated[index] = { ...updated[index], [field]: value };
    setAssetStates(updated);
  };

  /**
   * Preview asset number based on current template
   */
  const getAssetNumberPreview = () => {
    try {
      return labelTemplate.format
        .replace("{prefix}", companyPrefix || "COMP")
        .replace("{type}", labelTemplate.assetTypeCode || "01")
        .replace("{number}", "1000");
    } catch {
      return "Invalid template";
    }
  };

  /**
   * Handle tab change with unsaved changes warning
   */
  const handleTabChange = (newTab: string) => {
    if (hasUnsavedChanges() && activeTab === "general") {
      const confirmed = window.confirm(
        "You have unsaved changes on the General tab. Are you sure you want to switch tabs? Any unsaved changes will be lost."
      );
      if (!confirmed) {
        // Prevent tab change
        return;
      }
    }
    // If confirmed or no unsaved changes, allow the tab change
    setActiveTab(newTab);
  };

  return (
    <div className="space-y-6">
      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Configuration Manager
          </h1>
          <p className="text-muted-foreground">
            Customize your asset management system settings
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="labels">Asset Labels</TabsTrigger>
          <TabsTrigger value="types">Asset Types</TabsTrigger>
          <TabsTrigger value="states">Asset States</TabsTrigger>
        </TabsList>

        {/* General Configuration Tab */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Configure your company details and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPrefix">Company Prefix</Label>
                  <Input
                    id="companyPrefix"
                    value={companyPrefix}
                    onChange={(e) =>
                      setCompanyPrefix(e.target.value.toUpperCase())
                    }
                    placeholder="e.g., AIAA"
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#1E40AF"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={saveGeneralConfig} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Configuration"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Asset Labels Tab */}
        <TabsContent value="labels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Label Template</CardTitle>
              <CardDescription>
                Configure how asset numbers are generated (e.g., AIAA-01-1000)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="labelFormat">Label Format</Label>
                  <Input
                    id="labelFormat"
                    value={labelTemplate.format}
                    onChange={(e) =>
                      setLabelTemplate({
                        ...labelTemplate,
                        format: e.target.value,
                      })
                    }
                    placeholder="{prefix}-{type}-{number}"
                  />
                  <p className="text-sm text-muted-foreground">
                    Use placeholders: {"{prefix}"}, {"{type}"}, {"{number}"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="separator">Separator</Label>
                  <Input
                    id="separator"
                    value={labelTemplate.separator}
                    onChange={(e) =>
                      setLabelTemplate({
                        ...labelTemplate,
                        separator: e.target.value,
                      })
                    }
                    placeholder="-"
                    maxLength={3}
                  />
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-sm font-medium">Preview</Label>
                <div className="mt-2 text-lg font-mono">
                  {getAssetNumberPreview()}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Current company prefix:{" "}
                  <span className="font-medium">
                    {companyPrefix || "Not set"}
                  </span>
                </p>
              </div>

              <Button onClick={saveLabelTemplate} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Template"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Asset Types Tab */}
        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Types</CardTitle>
              <CardDescription>
                Define custom asset types and their codes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {assetTypes.map((type, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 gap-4 p-4 border rounded-lg"
                >
                  <div className="space-y-2">
                    <Label>Type Code</Label>
                    <Input
                      value={type.typeCode}
                      onChange={(e) =>
                        updateAssetType(index, "typeCode", e.target.value)
                      }
                      placeholder="01"
                      maxLength={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type Name</Label>
                    <Input
                      value={type.typeName}
                      onChange={(e) =>
                        updateAssetType(index, "typeName", e.target.value)
                      }
                      placeholder="Mobile Phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      value={type.category}
                      onChange={(e) =>
                        updateAssetType(index, "category", e.target.value)
                      }
                      placeholder="Mobile"
                    />
                  </div>
                  <div className="flex items-end space-x-2">
                    <div className="space-y-2 flex-1">
                      <Label>Icon</Label>
                      <Input
                        value={type.iconName}
                        onChange={(e) =>
                          updateAssetType(index, "iconName", e.target.value)
                        }
                        placeholder="phone"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeAssetType(index)}
                      className="h-10"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}

              <Button onClick={addAssetType} variant="outline">
                Add Asset Type
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Asset States Tab */}
        <TabsContent value="states" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset States</CardTitle>
              <CardDescription>
                Configure the workflow states for your assets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {assetStates.map((state, index) => (
                <div
                  key={index}
                  className="grid grid-cols-6 gap-4 p-4 border rounded-lg"
                >
                  <div className="space-y-2">
                    <Label>State Code</Label>
                    <Input
                      value={state.stateCode}
                      onChange={(e) =>
                        updateAssetState(index, "stateCode", e.target.value)
                      }
                      placeholder="AVAILABLE"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State Name</Label>
                    <Input
                      value={state.stateName}
                      onChange={(e) =>
                        updateAssetState(index, "stateName", e.target.value)
                      }
                      placeholder="Available Stock"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="color"
                        value={state.stateColor}
                        onChange={(e) =>
                          updateAssetState(index, "stateColor", e.target.value)
                        }
                        className="w-12 h-10"
                      />
                      <Input
                        value={state.stateColor}
                        onChange={(e) =>
                          updateAssetState(index, "stateColor", e.target.value)
                        }
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Order</Label>
                    <Input
                      type="number"
                      value={state.stateOrder}
                      onChange={(e) =>
                        updateAssetState(
                          index,
                          "stateOrder",
                          parseInt(e.target.value)
                        )
                      }
                      min={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Special</Label>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`start-${index}`}
                          checked={state.isStartState}
                          onChange={(e) =>
                            updateAssetState(
                              index,
                              "isStartState",
                              e.target.checked
                            )
                          }
                        />
                        <Label htmlFor={`start-${index}`} className="text-xs">
                          Start
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`end-${index}`}
                          checked={state.isEndState}
                          onChange={(e) =>
                            updateAssetState(
                              index,
                              "isEndState",
                              e.target.checked
                            )
                          }
                        />
                        <Label htmlFor={`end-${index}`} className="text-xs">
                          End
                        </Label>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeAssetState(index)}
                      className="h-10"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}

              <Button onClick={addAssetState} variant="outline">
                Add Asset State
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
