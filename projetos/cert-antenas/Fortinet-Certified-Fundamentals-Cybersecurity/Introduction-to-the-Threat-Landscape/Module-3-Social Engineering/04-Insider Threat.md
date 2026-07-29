# Module 3: Social Engineering

## Lesson 04: Insider Threat

---

# Overview

Organizations often focus heavily on external cyberattacks, but many security incidents originate from within the organization itself.

An insider threat can be intentional or accidental, malicious or careless. Because insiders already possess legitimate access to systems, data, and facilities, insider threats are often more difficult to detect and can cause significant damage.

Understanding insider threats is essential for protecting organizational assets, data, systems, and people.

---

# Learning Objectives

After completing this lesson, you should be able to:

* Define insider threat.
* Identify different types of insiders.
* Describe insider threat attack vectors and methods.
* Recognize behavioral and digital threat indicators.
* Understand insider threat mitigation techniques.

---

# What is an Insider Threat?

## Definition

An insider threat is an individual who works for an organization or has authorized access to its systems, networks, facilities, or data and who poses a cybersecurity or physical security threat.

---

# Who Can Be an Insider?

An insider may be:

* Current employee
* Former employee
* Contractor
* Vendor
* Business partner
* Board member
* Consultant
* Imposter with unauthorized access

---

# Why Insider Threats Are Dangerous

Unlike external attackers, insiders often have:

* Authorized access
* Knowledge of systems
* Understanding of processes
* Access to sensitive information
* Trust from coworkers

This makes insider attacks more difficult to detect and prevent.

---

# Insider Threat Categories

Insider threats are generally divided into two major groups:

```text
Insider Threats
│
├── Malicious Insiders
│
└── Careless Insiders
```

---

# 1. Malicious Insider

## Definition

A malicious insider intentionally causes harm to the organization.

These individuals knowingly abuse their access privileges for personal gain or to damage the organization.

---

# Common Goals of Malicious Insiders

* Espionage
* Fraud
* Sabotage
* Intellectual Property Theft
* Data Theft
* Financial Gain

---

# Real-World Example

In 2020, a former executive stole self-driving car trade secrets from his employer and provided them to a competing company.

### Outcome

* Convicted in court
* Sentenced to prison

---

# Types of Malicious Insiders

Malicious insiders can be divided into three categories:

---

# Lone Wolf

## Definition

A lone wolf acts independently without assistance from external parties.

### Characteristics

* Works alone
* Has malicious intent
* Uses legitimate access for harmful purposes

---

# Collaborator

## Definition

An insider who works with an external third party.

### Possible Partners

* Competitors
* Criminal organizations
* Nation-state actors
* Foreign intelligence agencies
* Individual attackers

---

# Mole

## Definition

A mole is an outsider who gains insider access by pretending to be a legitimate member of the organization.

---

# Common Disguises

* Employee
* Contractor
* Vendor
* Consultant
* Business partner

---

# Example: Emily Williams Attack

The fictitious employee "Emily Williams" successfully gained network access by posing as a legitimate employee.

This is a classic example of a:

### Mole

---

# 2. Careless Insider

## Definition

A careless insider unintentionally assists attackers through mistakes, poor judgment, negligence, or failure to follow security procedures.

Although not malicious, careless insiders can be just as dangerous as malicious insiders.

---

# Types of Careless Insiders

---

# Pawn

## Definition

A pawn is an authorized user manipulated by an attacker into helping them.

The pawn does not realize they are assisting the attacker.

---

# Common Methods Used Against Pawns

* Spear phishing
* Whaling
* Tailgating
* Smishing
* Vishing
* Pretexting

---

# Example

The Head of Information Security in the Emily Williams attack clicked a malicious birthday card link.

This individual acted as a:

### Pawn

---

# Goof

## Definition

A goof knowingly violates security policies but does not intend harm.

---

# Characteristics

* Careless
* Arrogant
* Ignorant
* Incompetent

---

# Examples

* Disabling antivirus software
* Ignoring security procedures
* Sharing passwords
* Using unauthorized devices

---

# Insider Threat Classification

| Category  | Type         | Description                                |
| --------- | ------------ | ------------------------------------------ |
| Malicious | Lone Wolf    | Acts independently                         |
| Malicious | Collaborator | Works with external parties                |
| Malicious | Mole         | Outsider posing as insider                 |
| Careless  | Pawn         | Manipulated by attackers                   |
| Careless  | Goof         | Violates policies without malicious intent |

---

# Insider Threat Attack Vectors

Attackers target insiders using multiple attack vectors.

---

# Physical Attack Vectors

## Tailgating (Piggybacking)

### Definition

An unauthorized person gains access by following an authorized person into a secure area.

---

## Shoulder Surfing

### Definition

Observing someone to steal information.

---

### Examples

* Watching passwords being entered
* Viewing confidential documents
* Observing screen activity

---

## Dumpster Diving

### Definition

Searching discarded materials for sensitive information.

---

### Examples

* Printed documents
* Financial reports
* Customer records
* Password notes

---

## Eavesdropping

### Definition

Listening to confidential conversations.

---

### Physical Example

Listening to a private discussion in a public place.

---

### Digital Example

Intercepting network communications.

Also known as:

* Sniffing
* Network Snooping

---

# Digital Attack Vectors

Attackers commonly target insiders using:

* Phishing
* Spear Phishing
* Whaling
* Smishing
* Vishing
* Pretexting

---

# Social Media Attack Vectors

Common methods include:

* Watering Hole Attacks
* Fake Profiles
* Relationship Building
* Social Media Reconnaissance

---

# Why Insider Attacks Are Difficult to Detect

Insiders already possess:

* Legitimate credentials
* Authorized access
* Knowledge of systems
* Familiarity with processes

This makes their activity appear normal.

---

# Behavioral Indicators of Insider Threats

Changes in behavior may indicate increased risk.

---

# Warning Signs

### Dissatisfaction

Employee appears angry or unhappy.

---

### Grudges

Employee openly expresses resentment toward the organization.

---

### Sudden Behavioral Changes

Significant changes without explanation.

---

### Excessive Enthusiasm

Employee suddenly seeks access to many new responsibilities.

---

### Policy Violations

Repeated disregard for security rules.

---

### Security Circumvention

Attempts to bypass established controls.

---

# Behavioral Threat Indicators

| Indicator                  | Risk                      |
| -------------------------- | ------------------------- |
| Grudge Against Employer    | Possible sabotage         |
| Sudden Behavior Change     | Potential threat          |
| Rule Violations            | Security concern          |
| Seeking Excessive Access   | Possible malicious intent |
| Security Control Avoidance | Elevated risk             |

---

# Digital Indicators of Insider Threats

Security teams should monitor abnormal activity patterns.

---

# Unusual Login Activity

Examples:

* Logging in at 4 AM
* Consistently working unusual hours

---

# Unusual Data Transfers

Examples:

* Large file transfers
* Excessive downloads
* Data movement outside normal patterns

---

# Abnormal Resource Access

Examples:

* Accessing unrelated systems
* Viewing sensitive information outside job duties

---

# Additional Digital Indicators

### Repeated Access Requests

Requests for systems unrelated to work responsibilities.

---

### Unauthorized Devices

Use of:

* USB drives
* Personal laptops
* Unapproved storage devices

---

### Network Crawling

Searching large portions of the network.

---

### Sensitive Data Searches

Looking for confidential information without business justification.

---

### External Data Transfers

Emailing sensitive information outside the organization.

---

# Digital Threat Indicators Summary

| Indicator                      | Example                            |
| ------------------------------ | ---------------------------------- |
| Unusual Login Time             | Logging in at 4 AM                 |
| Data Exfiltration              | Large file transfers               |
| Unauthorized Device Use        | USB drive usage                    |
| Excessive Permissions Requests | Access requests outside role       |
| Network Reconnaissance         | Crawling network resources         |
| External Email Activity        | Sending sensitive files externally |

---

# Employee Security Best Practices

Every employee contributes to organizational security.

---

# Recommended Practices

### Learn Security Policies

Understand organizational requirements.

---

### Follow Security Procedures

Never bypass approved controls.

---

### Protect Credentials

Do not expose usernames or passwords.

---

### Prevent Tailgating

Verify identities before granting access.

---

### Secure Documents

Protect both digital and physical records.

---

### Keep Security Controls Enabled

Do not disable:

* Antivirus
* Endpoint protection
* Security monitoring tools

---

### Protect Sensitive Information

Share confidential data only with authorized individuals.

---

### Apply Updates Promptly

Install:

* Operating System updates
* Security patches
* Software updates

---

# Insider Threat Mitigation

Organizations should take proactive measures to reduce insider risks.

---

# Step 1: Identify Critical Assets

Examples:

* Networks
* Systems
* Databases
* Facilities
* Employees
* Intellectual Property

---

# Step 2: Prioritize Assets

Focus protection efforts on the most valuable assets first.

---

# Step 3: Monitor Activity

Track:

* User activity
* Device activity
* Network behavior

---

# Machine Learning and Analytics

Modern security solutions use:

### Machine Learning (ML)

Benefits:

* Detect anomalies
* Prioritize alerts
* Reduce false positives

---

# User and Entity Behavior Analytics (UEBA)

## Definition

UEBA analyzes user and system behavior to identify suspicious activity.

---

# UEBA Functions

* Establishes normal behavior baselines
* Detects anomalies
* Generates alerts
* Assists investigations

---

# Database Activity Monitoring

Helps identify:

* Unauthorized access
* Policy violations
* Data theft attempts

---

# Deception Technology

Organizations can deploy deception systems that attract malicious insiders.

---

# FortiDeceptor

### Fortinet's Deception Platform

Functions:

* Creates honeypots
* Detects attackers
* Monitors malicious behavior
* Generates threat intelligence

---

# Security Awareness Training

One of the most effective defenses against insider threats is education.

Organizations should:

* Define security policies
* Document procedures
* Train employees
* Test understanding
* Enforce compliance

---

# Insider Threat Detection Framework

```text
Identify Critical Assets
          ↓
Monitor Users & Devices
          ↓
Analyze Behavior
          ↓
Detect Anomalies
          ↓
Investigate Threats
          ↓
Respond & Mitigate
```

---

# Key Terms

| Term             | Definition                                              |
| ---------------- | ------------------------------------------------------- |
| Insider Threat   | Authorized individual who poses a security risk         |
| Lone Wolf        | Malicious insider acting independently                  |
| Collaborator     | Insider working with an external actor                  |
| Mole             | Outsider pretending to be an insider                    |
| Pawn             | User manipulated by attackers                           |
| Goof             | Careless insider violating policies                     |
| Tailgating       | Following an authorized person into a secure area       |
| Shoulder Surfing | Observing someone to steal information                  |
| Dumpster Diving  | Searching discarded materials for sensitive information |
| Eavesdropping    | Intercepting conversations or communications            |
| UEBA             | User and Entity Behavior Analytics                      |
| FortiDeceptor    | Fortinet deception and honeypot solution                |

---

# Key Takeaways

* Insider threats can be malicious or accidental.
* Malicious insiders include lone wolves, collaborators, and moles.
* Careless insiders include pawns and goofs.
* Insider threats often have authorized access and network knowledge.
* Behavioral and digital indicators can help identify insider threats.
* UEBA and machine learning help detect abnormal activity.
* FortiDeceptor can help identify malicious insiders through deception techniques.
* Security awareness training is one of the most effective defenses.

---

# Knowledge Check & Quiz Review

### Q1: What is an insider threat?

**Answer:** An individual with authorized access who poses a physical or cybersecurity risk.

### Q2: What are the two main categories of insider threats?

**Answer:** Malicious insiders and careless insiders.

### Q3: What is a lone wolf?

**Answer:** A malicious insider acting independently.

### Q4: What is a collaborator?

**Answer:** An insider working with an external third party.

### Q5: What is a mole?

**Answer:** An outsider posing as a legitimate insider.

### Q6: What is a pawn?

**Answer:** A user manipulated into helping an attacker.

### Q7: What is a goof?

**Answer:** A careless insider who violates security policies without malicious intent.

### Q8: What is shoulder surfing?

**Answer:** Observing someone to obtain sensitive information.

### Q9: What does UEBA stand for?

**Answer:** User and Entity Behavior Analytics.

### Q10: What Fortinet product uses deception technology?

**Answer:** FortiDeceptor.

---

# Exam Tips

## Malicious Insider Types

```text
Lone Wolf
Collaborator
Mole
```

---

## Careless Insider Types

```text
Pawn
Goof
```

---

## Emily Williams Attack

Remember:

```text
Emily Williams
      ↓
Mole
```

---

## Birthday Card Victim

Remember:

```text
Manipulated User
      ↓
Pawn
```

---

## Fortinet Insider Threat Tool

```text
FortiDeceptor
```

---

## Insider Threat Detection Tool

```text
UEBA
(User and Entity Behavior Analytics)
```

---

# Summary

Insider threats originate from individuals who possess authorized access to organizational systems, networks, facilities, or data. These threats can be malicious, such as lone wolves, collaborators, and moles, or accidental, such as pawns and goofs. Because insiders already have access and knowledge of organizational resources, insider attacks can be difficult to detect. Organizations can reduce risk through monitoring, UEBA solutions, machine learning analytics, deception technologies like FortiDeceptor, strong security policies, and continuous employee awareness training.
