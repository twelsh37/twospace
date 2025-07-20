# Asset Transition Script

A Node.js script for transitioning assets through various lifecycle stages with proper asset history tracking.

## Features

- ✅ **Command Line Interface**: Easy-to-use CLI with `-b` and `-r` options
- ✅ **Bulk Operations**: Process multiple assets at once
- ✅ **State Validation**: Ensures valid state transitions
- ✅ **Path Transitions**: Automatically handles intermediate states
- ✅ **Asset History**: Creates complete audit trail for each transition
- ✅ **Error Handling**: Robust error handling and reporting
- ✅ **Progress Tracking**: Real-time progress updates and summaries

## Asset States

### Standard Assets (Phones, Tablets, Desktops, Laptops)
```
AVAILABLE → SIGNED_OUT → BUILDING → READY_TO_GO → ISSUED
```

### Monitors
```
AVAILABLE → SIGNED_OUT → READY_TO_GO → ISSUED
```

**Note**: Monitors skip the BUILDING stage as they are already complete devices and don't require configuration.

## Usage

### Basic Commands

```bash
# Transition assets to SIGNED_OUT state
yarn assets:signed-out 01-12345,01-12346,01-12347

# Transition assets to BUILDING state
yarn assets:building 01-12345,01-12346,01-12347

# Transition assets to READY_TO_GO state
yarn assets:ready 01-12345,01-12346,01-12347

# Direct script usage
tsx scripts/transition-assets.ts -s 01-12345,01-12346
tsx scripts/transition-assets.ts -b 01-12345,01-12346
tsx scripts/transition-assets.ts -r 01-12345,01-12346
```

### Advanced Usage

```bash
# Multiple operations in one command
tsx scripts/transition-assets.ts -s 01-12345 -b 01-12346 -r 01-12347

# Help
tsx scripts/transition-assets.ts -h
```

### Package.json Scripts

```bash
# Available yarn scripts
yarn assets:transition -s 01-12345,01-12346  # General transition
yarn assets:signed-out 01-12345,01-12346     # To SIGNED_OUT state
yarn assets:building 01-12345,01-12346       # To BUILDING state (standard assets only)
yarn assets:ready 01-12345,01-12346          # To READY_TO_GO state
yarn assets:fix-monitor-history               # Fix monitor asset history
```

## Examples

### Transition to Signed Out Stage

```bash
yarn assets:signed-out 01-07922,01-08662,04-91235
```

**Output:**
```
🏭 Asset Transition Script
========================

🚀 Starting asset transitions to SIGNED_OUT
📋 Assets: 01-07922, 01-08662, 04-91235

🔍 Looking up admin user...
✅ Found admin user: Tom Welsh (tom.welsh@theaiaa.com)

🔍 Fetching assets from database...
✅ Found 3 assets

📦 Processing asset: 01-07922 (current state: AVAILABLE)

🔄 Transitioning asset 01-07922 from AVAILABLE to SIGNED_OUT
   Path: AVAILABLE -> SIGNED_OUT
   📝 Transitioning: AVAILABLE -> SIGNED_OUT
   ✅ History recorded for AVAILABLE -> SIGNED_OUT
   ✅ Asset 01-07922 successfully transitioned to SIGNED_OUT

📊 Transition Summary:
   ✅ Successful: 3
   ❌ Failed: 0
   📦 Total processed: 3

🎉 Script completed successfully!
```

### Transition to Building Stage

```bash
yarn assets:building 01-07922,01-08662
```

**Output:**
```
🏭 Asset Transition Script
========================

🚀 Starting asset transitions to BUILDING
📋 Assets: 01-07922, 01-08662

🔍 Looking up admin user...
✅ Found admin user: Tom Welsh (tom.welsh@theaiaa.com)

🔍 Fetching assets from database...
✅ Found 2 assets

📦 Processing asset: 01-07922 (current state: SIGNED_OUT)

🔄 Transitioning asset 01-07922 from SIGNED_OUT to BUILDING
   Path: SIGNED_OUT -> BUILDING
   📝 Transitioning: SIGNED_OUT -> BUILDING
   ✅ History recorded for SIGNED_OUT -> BUILDING
   ✅ Asset 01-07922 successfully transitioned to BUILDING

📊 Transition Summary:
   ✅ Successful: 2
   ❌ Failed: 0
   📦 Total processed: 2

🎉 Script completed successfully!
```

### Transition to Ready to Go

```bash
yarn assets:ready 01-07922,01-08662
```

**Output:**
```
🏭 Asset Transition Script
========================

🚀 Starting asset transitions to READY_TO_GO
📋 Assets: 01-07922, 01-08662

🔍 Looking up admin user...
✅ Found admin user: Tom Welsh (tom.welsh@theaiaa.com)

🔍 Fetching assets from database...
✅ Found 2 assets

📦 Processing asset: 01-07922 (current state: BUILDING)

🔄 Transitioning asset 01-07922 from BUILDING to READY_TO_GO
   Path: BUILDING -> READY_TO_GO
   📝 Transitioning: BUILDING -> READY_TO_GO
   ✅ History recorded for BUILDING -> READY_TO_GO
   ✅ Asset 01-07922 successfully transitioned to READY_TO_GO

📊 Transition Summary:
   ✅ Successful: 2
   ❌ Failed: 0
   📦 Total processed: 2

🎉 Script completed successfully!
```

## Asset History Tracking

The script creates detailed asset history entries for each transition:

```json
{
  "assetId": "uuid",
  "previousState": "AVAILABLE",
  "newState": "BUILDING",
  "changedBy": "admin-user-id",
  "changeReason": "Asset moved to building stage",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "details": {
    "transitionType": "BUILDING",
    "performedBy": "script",
    "previousState": "AVAILABLE",
    "newState": "BUILDING",
    "transitionMethod": "script"
  }
}
```

## Requirements

### Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_connection_string
# OR
POSTGRES_URL_NON_POOLING=your_postgres_connection_string
```

## ✅ Recent Fixes

The script has been successfully converted from JavaScript to TypeScript to resolve import issues with the Drizzle ORM schema. The script now:

- ✅ **TypeScript Support**: Uses TypeScript with proper type safety and IntelliSense
- ✅ **Environment Loading**: Automatically loads environment variables from `.env.local`
- ✅ **Asset Type-Specific Logic**: Different transition paths for monitors vs standard assets
- ✅ **Correct State Order**:
  - Standard assets: `AVAILABLE → SIGNED_OUT → BUILDING → READY_TO_GO → ISSUED`
  - Monitors: `AVAILABLE → SIGNED_OUT → READY_TO_GO → ISSUED`
- ✅ **Smart Path Transitions**: Automatically handles complex state transitions through intermediate states
- ✅ **Complete Audit Trail**: Creates detailed asset history entries for each transition
- ✅ **Robust Error Handling**: Comprehensive error handling and user-friendly error messages
- ✅ **Multiple Database Support**: Works with both `DATABASE_URL` and `POSTGRES_URL_NON_POOLING` environment variables
- ✅ **Monitor History Fix**: Script to clean up incorrect BUILDING transitions from monitor history

### Migration from JavaScript to TypeScript

- **Before**: `node scripts/transition-assets.js` (CommonJS with import issues)
- **After**: `tsx scripts/transition-assets.ts` (TypeScript with proper imports)

The script now works seamlessly with the existing Drizzle ORM schema and provides full type safety throughout the asset transition process.

## 🔧 Monitor History Fix

### Problem
Monitors incorrectly went through the BUILDING stage in their asset history, even though monitors don't require building/configuration.

### Solution
Created a dedicated script to fix monitor asset history:

```bash
# Fix monitor asset history
yarn assets:fix-monitor-history
```

### What the Fix Script Does
1. **Finds Monitors**: Locates all monitors in READY_TO_GO state
2. **Checks History**: Identifies monitors with incorrect BUILDING transitions
3. **Removes BUILDING**: Deletes BUILDING stage transitions from monitor history
4. **Creates Direct Transitions**: Adds direct SIGNED_OUT → READY_TO_GO transitions where needed
5. **Audit Trail**: Records the fix in asset history with explanation

### Example Output
```
🏭 Fix Monitor Asset History Script
==================================

🔍 Looking up admin user...
✅ Found admin user: Tom Welsh (tom.welsh@theaiaa.com)

🔍 Finding monitors in READY_TO_GO state...
✅ Found 49 monitors in READY_TO_GO state

📦 Processing monitor: 05-20703 (MONITOR)
   ⚠️  Found BUILDING history, fixing...
   🔧 Fixing history for asset 3a9b733e-b47f-4461-aaf1-307a8c6ebb82...
   📝 Found 2 BUILDING transitions to remove
   🗑️  Removed transition: BUILDING → READY_TO_GO
   🗑️  Removed transition: SIGNED_OUT → BUILDING
   🔗 Creating direct transition: SIGNED_OUT → READY_TO_GO
   ✅ Created direct transition history entry
   ✅ Fixed history for 05-20703

📊 Fix Summary:
   📦 Monitors processed: 49
   ✅ Successfully fixed: 12
   🗑️  BUILDING transitions removed: 24
   ❌ Errors: 0

🎉 Successfully fixed 12 monitor histories!
```

### Database Requirements

- Admin user must exist in the `users` table
- Assets must exist in the `assets` table
- `asset_history` table must be available

## Error Handling

The script handles various error scenarios:

- ❌ **Missing Environment Variables**: Clear error messages
- ❌ **Invalid Asset Numbers**: Reports which assets weren't found
- ❌ **Invalid State Transitions**: Attempts path transitions
- ❌ **Database Errors**: Detailed error logging
- ❌ **Missing Admin User**: Falls back to any available user

## Safety Features

- 🔒 **State Validation**: Prevents invalid transitions
- 🔒 **Path Transitions**: Handles complex state changes
- 🔒 **Transaction Safety**: Each transition is atomic
- 🔒 **Audit Trail**: Complete history of all changes
- 🔒 **Error Recovery**: Continues processing other assets on failure

## Troubleshooting

### Common Issues

1. **"No users found in database"**
   - Ensure admin users exist in the database
   - Check user email addresses match expected values

2. **"No assets found with the provided asset numbers"**
   - Verify asset numbers are correct
   - Check assets exist in the database

3. **"Cannot transition from X to Y"**
   - Asset may be in an unexpected state
   - Script will attempt path transitions automatically

4. **Environment variable errors**
   - Ensure all required env vars are set
   - Check database connection string format

### Debug Mode

For detailed debugging, you can modify the script to add more logging:

```javascript
// Add to script for debug output
console.log('Debug: Asset data:', asset);
console.log('Debug: Transition path:', transitionPath);
```

## Contributing

When modifying the script:

1. **Test with small batches** first
2. **Verify asset history** is created correctly
3. **Check state transitions** follow business rules
4. **Update documentation** for any new features