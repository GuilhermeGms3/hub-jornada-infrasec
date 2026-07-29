# Module 1: Introduction to Cybersecurity

## Lesson 02: Principles of Information Security

---

# Learning Objectives

After completing this lesson, you should be able to:

* Explain the core principles of Information Security.
* Understand the CIA Triad.
* Understand the DAD Triad and how it relates to security threats.
* Define Authentication, Authorization, and Accounting (AAA).
* Understand how AAA helps secure systems and networks.

---

# Principles of Information Security

Information Security (InfoSec) is built on three fundamental principles known as the **CIA Triad**:

1. Confidentiality
2. Integrity
3. Availability

These principles serve as the foundation for protecting information and information systems.

---

# The CIA Triad

## 1. Confidentiality

**Confidentiality** ensures that information is accessible only to authorized users.

The goal is to prevent unauthorized individuals from viewing sensitive information.

### Examples

* Password-protected accounts
* Data encryption
* Access control policies
* Multi-Factor Authentication (MFA)

### Why It Matters

Without confidentiality, sensitive information such as customer records, financial data, and passwords could be exposed to attackers.

---

## 2. Integrity

**Integrity** ensures that information remains accurate, complete, and trustworthy.

Data should not be modified without proper authorization.

### Examples

* Hashing
* Digital signatures
* File integrity monitoring
* Version control systems

### Why It Matters

Users and organizations must trust that the information they use has not been altered maliciously or accidentally.

### Important Note

If data is changed, systems should be able to detect and report the modification.

---

## 3. Availability

**Availability** ensures that authorized users can access information and services whenever needed.

Systems, applications, and data should remain operational and accessible.

### Examples

* Data backups
* Redundant systems
* Disaster recovery plans
* High-availability infrastructure

### Why It Matters

If critical systems become unavailable, organizations may experience downtime, financial loss, and disruption of services.

---

# CIA Triad Summary

| Principle       | Purpose                                   | Example                     |
| --------------- | ----------------------------------------- | --------------------------- |
| Confidentiality | Prevent unauthorized access               | Encryption, passwords       |
| Integrity       | Protect data accuracy and trustworthiness | Hashing, digital signatures |
| Availability    | Ensure access when needed                 | Backups, redundancy         |

---

# The DAD Triad

The **DAD Triad** represents threats that Information Security aims to prevent.

DAD stands for:

* Disclosure
* Alteration
* Denial

It is essentially the opposite of the CIA Triad.

---

## 1. Disclosure

Disclosure occurs when confidential information is exposed to unauthorized individuals.

### Examples

* Data breaches
* Leaked passwords
* Unauthorized file access

### Impact

Loss of privacy, financial damage, and reputational harm.

---

## 2. Alteration

Alteration occurs when information is modified without authorization.

### Examples

* Database manipulation
* Malware changing files
* Unauthorized document editing

### Impact

Data becomes unreliable and untrustworthy.

---

## 3. Denial

Denial occurs when authorized users cannot access information or services.

### Examples

* Denial-of-Service (DoS) attacks
* Server outages
* Ransomware attacks

### Impact

Business operations may be interrupted and critical services become unavailable.

---

# CIA vs DAD

| CIA Principle   | Opposing DAD Threat |
| --------------- | ------------------- |
| Confidentiality | Disclosure          |
| Integrity       | Alteration          |
| Availability    | Denial              |

### Key Concept

Information Security seeks to maintain:

* Confidentiality
* Integrity
* Availability

While preventing:

* Disclosure
* Alteration
* Denial

---

# Security Controls Against DAD

Organizations use security controls to protect information from DAD threats.

Examples include:

* Firewalls
* Intrusion Detection Systems (IDS)
* Intrusion Prevention Systems (IPS)
* Encryption
* Access controls
* Security monitoring solutions

These controls help preserve the CIA Triad.

---

# AAA Framework

Another important Information Security concept is **AAA**.

AAA stands for:

1. Authentication
2. Authorization
3. Accounting

AAA is a security framework used to:

* Verify identities
* Control access
* Track user activities

AAA plays an important role in cybersecurity, network management, and access control.

---

# 1. Authentication

**Authentication** is the process of verifying the identity of a user, device, or system.

It answers the question:

> "Who are you?"

Before access is granted, the system must confirm that the user is who they claim to be.

### Common Authentication Methods

#### Something You Know

* Password
* PIN

#### Something You Have

* Security token
* Smart card
* Mobile authentication app

#### Something You Are

* Fingerprint
* Facial recognition
* Retina scan

### Example

A user enters a username and password to log in to a company network.

The system verifies the credentials before granting access.

---

# 2. Authorization

**Authorization** determines what an authenticated user is allowed to access.

It answers the question:

> "What are you allowed to do?"

After identity verification, permissions are checked.

### Examples

* Reading files
* Editing documents
* Accessing applications
* Managing systems

### Example

A manager may access payroll records, while a regular employee cannot.

### Important Point

Authorization levels can be modified by system administrators.

---

# 3. Accounting

**Accounting** involves recording and monitoring user activities on systems and networks.

It answers the question:

> "What did the user do?"

Accounting provides logs and audit records for security analysis.

---

## Information Commonly Recorded

* Login and logout times
* Session duration
* IP address
* Data sent and received
* Websites visited
* Services accessed
* User actions

---

## Why Accounting is Important

Accounting helps organizations:

* Audit user activities
* Detect suspicious behavior
* Investigate security incidents
* Monitor resource usage
* Generate billing reports

---

# AAA Summary

| Component      | Purpose                    | Question Answered    |
| -------------- | -------------------------- | -------------------- |
| Authentication | Verify identity            | Who are you?         |
| Authorization  | Control access permissions | What can you access? |
| Accounting     | Track user activity        | What did you do?     |

---

# Real-World Example of AAA

Imagine an employee logging into a company network:

### Authentication

The employee enters a username and password.

The system verifies their identity.

### Authorization

The system determines which applications and files the employee can access.

### Accounting

The system records:

* Login time
* Logout time
* Files accessed
* Actions performed

This creates an audit trail for security and compliance purposes.

---

# Key Takeaways

* The CIA Triad consists of Confidentiality, Integrity, and Availability.
* The CIA Triad forms the foundation of Information Security.
* The DAD Triad (Disclosure, Alteration, Denial) represents threats to information.
* Security controls aim to prevent DAD and maintain CIA.
* AAA stands for Authentication, Authorization, and Accounting.
* Authentication verifies identity.
* Authorization determines permissions.
* Accounting records user activity and creates audit logs.

---

# Exam Tips

✅ CIA = Confidentiality, Integrity, Availability.

✅ DAD = Disclosure, Alteration, Denial.

✅ Confidentiality prevents Disclosure.

✅ Integrity prevents Alteration.

✅ Availability prevents Denial.

✅ Authentication = Who are you?

✅ Authorization = What are you allowed to do?

✅ Accounting = What did you do?

✅ AAA is one of the most important foundational security concepts and is frequently tested in cybersecurity certifications.
