# User Manual - TwoSpace Asset Management System

<!--
Filepath: frontend/documentation/USER_MANUAL.md
This is the main user manual for the TwoSpace Asset Management System.
It provides detailed instructions for end users on how to use the application.
-->

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [Core Features](#3-core-features)
4. [Common Workflows](#4-common-workflows)
5. [Troubleshooting & FAQs](#5-troubleshooting--faqs)
6. [Glossary](#6-glossary)

## 1. Introduction

### What is TwoSpace?

TwoSpace is a web-based Asset Management System that helps organizations track and manage their IT assets throughout their complete lifecycle. Whether you're an IT administrator, department manager, or end user, TwoSpace provides the tools you need to efficiently manage technology assets.

### Key Benefits

- **Centralized Asset Tracking**: All your organization's IT assets in one place
- **Real-time Visibility**: See asset status, location, and assignment at a glance
- **Efficient Workflows**: Streamlined processes for asset management
- **Comprehensive Reporting**: Generate reports for compliance and planning
- **Barcode Scanning**: Quick asset lookup and data entry
- **Mobile-Friendly**: Access the system from any device

### Who Should Use This Manual?

- **IT Administrators**: Managing assets, users, and system configuration
- **IT Staff**: Building, configuring, and assigning assets
- **Department Managers**: Allocating assets and managing locations
- **End Users**: Viewing assigned assets and basic information
- **Finance Teams**: Accessing asset valuation and cost data
- **Compliance Teams**: Generating audit reports

## 2. Getting Started

### Logging In

1. **Access the Application**
   - Open your web browser
   - Navigate to your organization's TwoSpace URL
   - You'll see the login page

2. **Enter Your Credentials**
   - Enter your email address
   - Enter your password
   - Click "Sign In"

3. **First Time Setup**
   - If this is your first login, you may need to verify your email
   - Follow the instructions sent to your email address
   - Set up your password if required

### Understanding the Interface

#### Navigation Sidebar

The sidebar on the left contains the main navigation:

- **Dashboard**: Overview of system statistics and recent activity
- **Assets**: View and manage all assets
- **Locations**: Manage physical locations
- **Users**: User management (Admin only)
- **Reports**: Generate and export reports
- **Imports**: Bulk data import (Admin only)
- **Settings**: System configuration (Admin only)

#### Header

The top header shows:
- **User Menu**: Your profile and logout options
- **Notifications**: Any system alerts or messages
- **Search**: Quick search functionality

#### Main Content Area

The main area displays the current page content, such as:
- Data tables with filtering and sorting
- Forms for adding or editing information
- Charts and statistics
- Reports and exports

### User Roles and Permissions

#### Admin Users
- Full access to all features
- Can add, edit, and delete assets, users, and locations
- Can generate reports and export data
- Can manage system settings

#### Standard Users
- View-only access to assets and locations
- Cannot modify system data
- Cannot access user management
- Can view assigned assets

## 3. Core Features

### 3.1 Asset Management

#### Viewing Assets

1. **Navigate to Assets**
   - Click "Assets" in the sidebar
   - You'll see a table of all assets in the system

2. **Using Filters**
   - **Asset Type**: Filter by Mobile Phone, Tablet, Desktop, Laptop, or Monitor
   - **State**: Filter by current state (Available, Signed Out, Building, etc.)
   - **Status**: Filter by status (Active, Inactive, etc.)
   - **Location**: Filter by physical location
   - **Clear Filters**: Click "Clear Filters" to reset all filters

3. **Searching Assets**
   - Use the search box to find assets by:
     - Asset number
     - Serial number
     - Description
     - Assigned user

4. **Asset Details**
   - Click on any asset row to view detailed information
   - See asset history, assignments, and current status

#### Asset States and Lifecycle

**Understanding Asset States:**

- **Holding**: Asset is in storage, not yet available for use
- **Available Stock**: Asset is ready to be signed out
- **Signed Out**: Asset has been taken from stock for processing
- **Building**: Asset is being configured or set up (devices only)
- **Ready to Go**: Asset is configured and ready for assignment
- **Issued**: Asset is assigned to a person or location

**Asset Lifecycle by Type:**

**Devices (Phones, Laptops, Desktops, Tablets):**
1. Holding → Available Stock → Signed Out → Building → Ready to Go → Issued

**Monitors:**
1. Holding → Available Stock → Signed Out → Issued

#### Asset Actions (Admin Only)

1. **Adding New Assets**
   - Click "Add Asset" button
   - Fill in required information:
     - Asset type
     - Serial number
     - Purchase price
     - Description
   - Click "Save"

2. **Editing Assets**
   - Click the edit icon on any asset row
   - Modify the information as needed
   - Click "Save"

3. **Changing Asset State**
   - Select one or more assets
   - Choose the appropriate action from the dropdown
   - Confirm the state change

4. **Assigning Assets**
   - Select an asset in "Ready to Go" state
   - Click "Assign"
   - Choose individual or shared assignment
   - Select the person or location
   - Confirm assignment

#### Barcode Scanning

**USB Barcode Scanner:**
1. Connect your USB barcode scanner
2. Focus on any barcode input field
3. Scan the asset barcode
4. The system will automatically populate the field

**Camera-based Scanning:**
1. Click the camera icon next to a barcode field
2. Grant camera permissions
3. Point your camera at the barcode
4. The system will detect and process the barcode

### 3.2 Locations

#### Viewing Locations

1. **Navigate to Locations**
   - Click "Locations" in the sidebar
   - View all physical locations in the system

2. **Location Information**
   - Location name and description
   - Number of assets assigned to each location
   - Location type and status

#### Managing Locations (Admin Only)

1. **Adding Locations**
   - Click "Add Location"
   - Enter location name and description
   - Click "Save"

2. **Editing Locations**
   - Click the edit icon on any location
   - Modify information as needed
   - Click "Save"

3. **Viewing Location Assignments**
   - Click on any location to see assigned assets
   - View asset details and assignment history

### 3.3 Users

#### Viewing Users (Admin Only)

1. **Navigate to Users**
   - Click "Users" in the sidebar
   - View all users in the system

2. **User Information**
   - Name and email address
   - Employee ID and department
   - Role (Admin or User)
   - Assigned assets

#### Managing Users (Admin Only)

1. **Adding Users**
   - Click "Add User"
   - Enter user details:
     - Name
     - Email
     - Employee ID
     - Department
     - Role
   - Click "Save"

2. **Editing Users**
   - Click the edit icon on any user
   - Modify information as needed
   - Click "Save"

3. **Viewing User Assets**
   - Click on any user to see their assigned assets
   - View asset details and assignment history

### 3.4 Reports

#### Generating Reports

1. **Navigate to Reports**
   - Click "Reports" in the sidebar
   - Choose the type of report you need

2. **Available Reports**
   - **Asset Inventory**: Complete list of all assets with current status
   - **Financial Summary**: Asset valuation and cost analysis
   - **User Assignments**: Assets assigned to each user
   - **Location Summary**: Assets by location

3. **Applying Filters**
   - Use the same filters available in the Assets section
   - Filter by date range, asset type, state, or location
   - Click "Generate Report"

#### Exporting Reports

1. **PDF Export**
   - Click "Export PDF" button
   - The report will be generated with charts and tables
   - Download the PDF file

2. **Data Export**
   - Export raw data for external analysis
   - Choose CSV or Excel format
   - Download the file

### 3.5 Dashboard

#### Overview Dashboard

The dashboard provides a quick overview of your asset management system:

1. **Statistics Cards**
   - Total assets in the system
   - Available stock count
   - Assets ready for assignment
   - Active users

2. **Asset Distribution Charts**
   - Assets by type (phones, laptops, monitors, etc.)
   - Assets by state (available, issued, building, etc.)

3. **Recent Activity**
   - Latest asset state changes
   - Recent assignments
   - System updates

4. **Quick Actions**
   - Add new asset
   - Generate report
   - Import data
   - View alerts

## 4. Common Workflows

### Asset Assignment Workflow

**Scenario**: Assigning a laptop to a new employee

1. **Find Available Asset**
   - Go to Assets page
   - Filter by Type: Laptop
   - Filter by State: Ready to Go
   - Select an appropriate laptop

2. **Assign the Asset**
   - Click "Assign" button
   - Choose "Individual Assignment"
   - Select the employee from the user list
   - Confirm assignment

3. **Verify Assignment**
   - Asset state changes to "Issued"
   - Asset appears in user's assigned assets
   - Assignment is logged in asset history

### Asset Return Workflow

**Scenario**: Processing a returned laptop

1. **Locate the Asset**
   - Search for the asset by serial number or asset number
   - Or find it in the user's assigned assets

2. **Process Return**
   - Select the asset
   - Choose "Return to Available Stock"
   - Confirm the action

3. **Asset Status Update**
   - Asset state changes to "Available Stock"
   - Assignment is removed
   - Return is logged in asset history

### Bulk Import Workflow

**Scenario**: Importing new assets from a supplier

1. **Prepare Data File**
   - Create CSV or Excel file with asset data
   - Include columns: Serial Number, Type, Purchase Price, Description

2. **Upload File**
   - Go to Imports page
   - Select "Assets" import type
   - Upload your file

3. **Map Columns**
   - Match your file columns to system fields
   - Verify data mapping is correct

4. **Review and Import**
   - Review the preview of imported data
   - Confirm import
   - Assets are created in "Holding" state

5. **Process Imported Assets**
   - Move assets from "Holding" to "Available Stock"
   - Begin normal asset workflow

### Reporting Workflow

**Scenario**: Generating monthly asset report

1. **Access Reports**
   - Go to Reports page
   - Select "Asset Inventory"

2. **Apply Filters**
   - Set date range for the month
   - Filter by relevant asset types
   - Include all locations

3. **Generate Report**
   - Click "Generate Report"
   - Review the data

4. **Export Report**
   - Click "Export PDF"
   - Download the report
   - Share with stakeholders

## 5. Troubleshooting & FAQs

### Common Issues

#### Login Problems

**Q: I can't log in to the system**
A: Check the following:
- Verify your email address is correct
- Ensure your password is entered correctly
- Check if your account is active
- Contact your system administrator if issues persist

**Q: I forgot my password**
A: Use the "Forgot Password" link on the login page to reset your password.

#### Asset Management Issues

**Q: I can't see certain assets**
A: This might be due to:
- Your user role permissions
- Asset filters applied to the view
- Assets assigned to different locations
- Try clearing filters or contact your administrator

**Q: I can't change an asset's state**
A: Only administrators can change asset states. Contact your IT administrator for assistance.

**Q: Asset information is missing or incorrect**
A: Contact your system administrator to update asset information.

#### Technical Issues

**Q: The page is loading slowly**
A: Try the following:
- Refresh the page
- Clear your browser cache
- Check your internet connection
- Contact IT support if the issue persists

**Q: Barcode scanning isn't working**
A: For USB scanners:
- Ensure the scanner is properly connected
- Check if the scanner is in keyboard emulation mode
- Try scanning into a text field first

For camera scanning:
- Ensure camera permissions are granted
- Check that you're using HTTPS
- Try refreshing the page

### Error Messages

The system is designed to handle errors gracefully. If you encounter an error:

1. **Read the Error Message**: Clear, user-friendly messages explain what went wrong
2. **Follow Instructions**: The message will tell you what to do next
3. **Contact Support**: If you can't resolve the issue, contact your system administrator

**Common Error Messages:**

- **"Unauthorized Access"**: You don't have permission for this action
- **"Asset Not Found"**: The asset you're looking for doesn't exist
- **"Invalid State Transition"**: The requested state change isn't allowed
- **"Network Error"**: Connection problem, try refreshing the page

### Getting Help

1. **Check This Manual**: Look for relevant sections
2. **Ask Your Administrator**: For permission or configuration issues
3. **Contact IT Support**: For technical problems
4. **System Logs**: Administrators can check system logs for detailed error information

## 6. Glossary

### Asset Terms

**Asset**: Any physical IT equipment tracked in the system (phones, laptops, monitors, etc.)

**Asset Number**: Unique identifier assigned to each asset (format: XX-YYYYY)

**Asset State**: Current status of an asset in its lifecycle (Holding, Available, Issued, etc.)

**Asset Type**: Category of asset (Mobile Phone, Laptop, Desktop, Tablet, Monitor)

**Assignment**: The act of assigning an asset to a person or location

**Barcode**: Machine-readable code used for quick asset identification

### System Terms

**Admin**: User with full system access and management capabilities

**Dashboard**: Main overview page showing system statistics and recent activity

**Filter**: Tool to narrow down displayed data based on specific criteria

**Import**: Process of adding multiple assets or users from external files

**Location**: Physical place where assets are stored or used

**Report**: Generated document showing asset information and statistics

**User**: Person with access to the system (either Admin or standard User)

### Workflow Terms

**Building**: Process of configuring and setting up devices for use

**Holding**: Temporary storage state for newly imported assets

**Issued**: State when an asset is assigned to a person or location

**Ready to Go**: State when a device is configured and ready for assignment

**Signed Out**: State when an asset is taken from available stock for processing

---

*This manual is maintained by the TwoSpace development team. Last updated: January 2025*
