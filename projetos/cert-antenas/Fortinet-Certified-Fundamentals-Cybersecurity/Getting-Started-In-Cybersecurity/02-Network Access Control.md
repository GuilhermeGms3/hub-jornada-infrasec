## Lesson 02: Network Access Control (NAC)

---

# Overview

As organizations expand their networks with employee devices, guest devices, Bring Your Own Device (BYOD) programs, and Internet of Things (IoT) devices, controlling who and what can access the network becomes increasingly challenging.

Traditional authentication methods alone are no longer sufficient. Organizations require visibility into every device, user, and connection attempting to access network resources.

**Network Access Control (NAC)** addresses this challenge by identifying, authenticating, profiling, monitoring, and controlling devices before they are allowed onto the network.

This lesson explores NAC, its evolution, how it works, and the security benefits it provides.

---

# Learning Objectives

After completing this lesson, you should be able to:

* Explain how Network Access Control (NAC) protects networks.
* Understand the evolution of NAC.
* Describe NAC authentication methods.
* Explain NAC's role in BYOD and IoT environments.
* Identify advanced NAC capabilities.
* List the benefits of NAC.

---

# What is Network Access Control (NAC)?

## Definition

Network Access Control (NAC) is a security solution that controls and monitors access to a network by authenticating, profiling, classifying, and enforcing policies on connected devices and users.

---

# Primary Functions of NAC

NAC provides:

* Device discovery
* Device profiling
* Authentication
* Authorization
* Policy enforcement
* Network segmentation
* Continuous monitoring

---

# Simple Definition

```text
Who Are You?
      ↓
What Device Are You Using?
      ↓
Should You Be Allowed?
      ↓
Grant or Deny Access
```

---

# Why NAC is Needed

Organizations must manage:

* Employees
* Contractors
* Partners
* Guests
* Mobile devices
* IoT devices
* Remote workers

Without NAC:

```text
Unknown Device
      ↓
Connects to Network
      ↓
Potential Security Risk
```

With NAC:

```text
Unknown Device
      ↓
Identify & Profile
      ↓
Policy Check
      ↓
Allow or Block
```

---

# NAC Architecture

Most NAC solutions use a centralized architecture.

---

# Benefits of Centralization

* Central policy management
* Multi-site visibility
* Device inventory management
* Consistent security enforcement

---

# Core NAC Components

A traditional NAC implementation contains three primary components.

---

# 1. Client Device

The endpoint requesting network access.

### Examples

* Laptop
* Smartphone
* Tablet
* Printer
* IP Camera
* IoT Sensor

---

# 2. Authenticator

The device controlling access to the protected network.

### Examples

* Network Switch
* Wireless Access Point (AP)

---

# 3. Authentication Server

Validates credentials and determines whether access should be granted.

---

# NAC Authentication Process

```text
Client Device
      ↓
Authenticator
(Switch / AP)
      ↓
Authentication Server
      ↓
Approve or Reject
      ↓
Network Access Granted or Denied
```

---

# NAC and IEEE 802.1X

## Definition

IEEE 802.1X is a network access control standard used to authenticate devices before granting network access.

---

# Purpose

Prevent unauthorized devices from joining the network.

---

# Authentication Methods

Devices may authenticate using:

* Username and Password
* Digital Certificates
* Security Tokens
* Other Credentials

---

# IEEE 802.1X Authentication Flow

```text
Device Connects
       ↓
Credentials Submitted
       ↓
Authenticator Forwards Request
       ↓
Authentication Server Verifies
       ↓
Access Granted or Denied
```

---

# Captive Portal

## Definition

A Captive Portal is a web page users must interact with before receiving network access.

---

# Common Examples

* Coffee Shops
* Airports
* Hotels
* Public Wi-Fi Networks

---

# Captive Portal Process

```text
Connect to Wi-Fi
       ↓
Redirect to Login Page
       ↓
Accept Terms / Login
       ↓
Internet Access Granted
```

---

# Evolution of NAC

As organizations adopted new technologies, traditional authentication became insufficient.

---

# New Challenges

### BYOD (Bring Your Own Device)

Employees began connecting personal devices to corporate networks.

Examples:

* Personal laptops
* Smartphones
* Tablets

---

# BYOD Security Concerns

The organization cannot fully control:

* Installed software
* Antivirus protection
* Operating system updates
* User behavior

---

# BYOD Risk

```text
Personal Device
      ↓
Unknown Security State
      ↓
Corporate Network Risk
```

---

# Internet of Things (IoT)

## Definition

IoT devices are connected devices that collect and transmit data over the internet.

---

# Examples

* IP Cameras
* Smart Printers
* Sensors
* Smart Thermostats
* Access Control Systems

---

# Why Organizations Use IoT

Benefits include:

* Automation
* Monitoring
* Predictive maintenance
* Cost savings

---

# Example

A smart printer can:

```text
Detect Low Toner
      ↓
Notify Vendor
      ↓
Replacement Sent Automatically
```

---

# IoT Security Challenges

IoT devices often have:

* Limited processing power
* Limited memory
* Weak security controls
* Fixed credentials
* Minimal visibility

---

# Major IoT Risks

```text
Large Number of Devices
          ↓
Expanded Attack Surface
          ↓
Increased Risk
```

---

# How NAC Solves BYOD and IoT Challenges

When NAC is deployed, it first identifies and profiles every device connected to the network.

---

# Device Profiling

## Definition

Device profiling is the process of identifying device type, behavior, and purpose.

---

# Examples

| Device     | Profile              |
| ---------- | -------------------- |
| Laptop     | Employee Workstation |
| IP Camera  | Security Device      |
| Printer    | Print Service Device |
| Smartphone | Mobile Endpoint      |
| Sensor     | IoT Device           |

---

# NAC Profiling Process

```text
Device Connects
       ↓
NAC Identifies Device
       ↓
Profile Assigned
       ↓
Policy Applied
```

---

# Function-Based Access Control

NAC grants access based on device function.

---

# Example: IP Camera

Allowed:

```text
IP Camera
      ↓
NVR Server
```

---

# Blocked:

```text
IP Camera
      ↓
Finance Server
```

---

# Why?

The camera has no legitimate reason to communicate with finance systems.

---

# Network Segmentation with NAC

NAC automatically places devices into appropriate network segments.

---

# Segmentation Example

```text
Employees → VLAN 10

Printers → VLAN 20

IP Cameras → VLAN 30

Guests → VLAN 40
```

---

# Security Benefit

If malware infects one device:

```text
Compromised Device
        ↓
Restricted Segment
        ↓
Limited Spread
```

---

# Guest Access Management

Organizations frequently require temporary network access.

Examples:

* Visitors
* Contractors
* Vendors
* Business Partners

---

# NAC Guest Access

NAC enables:

* Self-registration
* Temporary credentials
* Policy-based access
* Expiration controls

---

# Guest Access Workflow

```text
Guest Connects
      ↓
Self-Service Portal
      ↓
Temporary Access Granted
      ↓
Restricted Network Access
```

---

# Continuous Policy Enforcement

Networks constantly change.

New:

* Users
* Devices
* Applications
* Business requirements

must be continuously evaluated.

---

# Dynamic Policy Management

```text
User Changes
     ↓
Policy Updated
     ↓
Access Adjusted
```

---

# NAC and Security Automation

Modern NAC platforms integrate with security operations.

---

# Automated Threat Response

When a threat is detected:

```text
Threat Detected
      ↓
NAC Receives Alert
      ↓
Device Isolated
      ↓
SOC Notified
```

---

# Security Operations Center (SOC)

NAC can automatically:

* Notify SOC teams
* Trigger investigations
* Isolate infected devices
* Prevent lateral movement

---

# Reporting and Visibility

NAC generates:

* Device inventories
* Access reports
* Security events
* Compliance reports

---

# NAC Integrations

Modern NAC solutions integrate with other security products.

---

# Common Integrations

* Firewalls
* Switches
* Wireless Controllers
* SIEM Platforms
* Endpoint Security Solutions

---

# Integration Methods

### RESTful APIs

Application-based integrations.

---

### SSH

Secure command-line integrations.

---

# Benefits of NAC

---

# 1. Improved Security

NAC continuously monitors:

* Users
* Devices
* Connections

---

# Security Benefits

```text
Authenticate
      ↓
Authorize
      ↓
Monitor
      ↓
Protect
```

---

# 2. Cost Savings

Automation reduces manual administration.

Benefits:

* Lower operational costs
* Fewer support tickets
* Reduced security incidents

---

# 3. Automation

NAC automatically:

* Identifies devices
* Applies policies
* Enforces access controls

---

# Why Automation Matters

```text
Thousands of Devices
         ↓
Manual Management Impossible
         ↓
Automation Required
```

---

# 4. Enhanced User Experience

Authorized users receive:

* Faster access
* Seamless connectivity
* Reduced friction

---

# 5. Ease of Control

NAC provides a continuously updated inventory of:

* Users
* Devices
* Access permissions

---

# Lifecycle Management

IT teams can easily:

* Track assets
* Replace devices
* Remove obsolete equipment
* Maintain compliance

---

# Fortinet NAC Solution

## FortiNAC

Fortinet's NAC platform is called **[FortiNAC™](https://www.fortinet.com/products/network-access-control/fortinac?utm_source=chatgpt.com)**.

---

# Key Capabilities

FortiNAC provides:

* Device discovery
* Device profiling
* Network segmentation
* Policy enforcement
* Guest management
* Automated threat response
* Security Fabric integration

---

# FortiNAC Threat Response

```text
Device Violates Policy
         ↓
FortiNAC Detects Issue
         ↓
Device Isolated
         ↓
Threat Contained
```

---

# NAC Feature Summary

| Capability       | Description                      |
| ---------------- | -------------------------------- |
| Authentication   | Verifies users and devices       |
| Authorization    | Grants appropriate access        |
| Device Profiling | Identifies device function       |
| Segmentation     | Separates devices by role        |
| Guest Access     | Supports temporary users         |
| Automation       | Applies policies automatically   |
| Reporting        | Provides visibility and auditing |
| Threat Response  | Isolates compromised devices     |

---

# Key Terms

| Term                  | Definition                            |
| --------------------- | ------------------------------------- |
| NAC                   | Network Access Control                |
| IEEE 802.1X           | Network authentication standard       |
| Authenticator         | Device controlling access             |
| Authentication Server | Validates credentials                 |
| Captive Portal        | Web page used before granting access  |
| BYOD                  | Bring Your Own Device                 |
| IoT                   | Internet of Things                    |
| Device Profiling      | Identifying device type and purpose   |
| VLAN                  | Virtual Local Area Network            |
| Segmentation          | Dividing networks into isolated zones |
| SOC                   | Security Operations Center            |
| REST API              | Interface for application integration |
| FortiNAC              | Fortinet's NAC solution               |

---

# Key Takeaways

* NAC controls access to a network through authentication, authorization, and profiling.
* NAC originated from IEEE 802.1X authentication standards.
* Captive portals provide an alternative access-control method.
* BYOD and IoT significantly expanded network attack surfaces.
* NAC profiles devices and grants access according to function.
* NAC improves security through segmentation and policy enforcement.
* Guest users can receive controlled temporary access.
* NAC integrates with security systems and can automate incident response.
* Automation, visibility, and centralized management are major benefits.
* FortiNAC extends NAC capabilities through Security Fabric integration and automated threat containment.

---

# Knowledge Check & Quiz Review

### Q1: What does NAC stand for?

**Answer:** Network Access Control.

### Q2: What is the primary purpose of NAC?

**Answer:** To control and secure network access by authenticating and profiling users and devices.

### Q3: What standard is commonly associated with NAC authentication?

**Answer:** IEEE 802.1X.

### Q4: What are the three parties involved in 802.1X authentication?

**Answer:** Client Device, Authenticator, and Authentication Server.

### Q5: What is a captive portal?

**Answer:** A web page users must interact with before receiving network access.

### Q6: What does BYOD stand for?

**Answer:** Bring Your Own Device.

### Q7: Why do IoT devices present security challenges?

**Answer:** They often lack strong security controls, visibility, and update capabilities.

### Q8: What is device profiling?

**Answer:** Identifying a device's type, purpose, and behavior before assigning access policies.

### Q9: Why is segmentation important?

**Answer:** It limits malware spread and reduces attack impact.

### Q10: How can NAC assist a SOC?

**Answer:** By automatically detecting, isolating, and reporting compromised devices.

### Q11: What are two common NAC integration methods?

**Answer:** REST APIs and SSH.

### Q12: What is Fortinet's NAC solution called?

**Answer:** FortiNAC.

---

# Exam Tips

## NAC Core Function

```text
Authenticate
      ↓
Authorize
      ↓
Profile
      ↓
Control Access
```

---

## Remember 802.1X Components

```text
Client
   ↓
Authenticator
   ↓
Authentication Server
```

---

## NAC and IoT

```text
Identify
    ↓
Profile
    ↓
Segment
    ↓
Protect
```

---

## NAC Security Goal

```text
Right User
Right Device
Right Access
Right Time
```

---

## FortiNAC

Remember:

```text
Visibility
Automation
Segmentation
Threat Isolation
```

These are among the most commonly tested NAC concepts in Fortinet cybersecurity fundamentals.

---

# Summary

Network Access Control (NAC) is a foundational security technology that authenticates, profiles, authorizes, and monitors devices connecting to a network. Originally based on IEEE 802.1X authentication, NAC evolved to address modern challenges introduced by BYOD and IoT devices. By profiling endpoints, enforcing segmentation, automating policy enforcement, and integrating with broader security ecosystems, NAC significantly improves visibility, security, and operational efficiency. FortiNAC extends these capabilities by integrating with the Fortinet Security Fabric and automatically isolating devices that violate security policies.
