# Module 2: The Threat Landscape

## Lesson 03: Cybersecurity Threats

---

# Overview

Cybersecurity threats are actions that exploit vulnerabilities in systems, networks, applications, or people to cause harm.

Threat actors use various attack vectors to gain unauthorized access, steal information, disrupt services, or damage computer systems.

Understanding cybersecurity threats helps security professionals identify weaknesses, reduce risks, and implement effective security controls.

---

# Learning Objectives

After completing this lesson, you should be able to:

* Define cybersecurity threats.
* Understand attack vectors and attack paths.
* Identify the four main categories of cybersecurity threats.
* Describe common attack vectors and how they are used.
* Understand the difference between pre-exploit and post-exploit attacks.

---

# What is a Cybersecurity Threat?

A **Cybersecurity Threat** is any action that exploits a vulnerability and causes harm to a computer system, network, application, or data.

### Simple Definition

> Threat = Vulnerability + Exploitation + Harm

### Examples

* Phishing attack stealing credentials
* Malware infection
* Ransomware attack
* Unauthorized access to systems
* DDoS attack

---

# What is an Attack Vector?

An **Attack Vector** is the method or path used by a threat actor to gain unauthorized access to a system or network.

Attack vectors explain **how an attacker exploits a vulnerability**.

---

# Components of an Attack Vector

Every attack vector consists of three components:

| Component     | Description                                             |
| ------------- | ------------------------------------------------------- |
| Vulnerability | Weakness that can be exploited                          |
| Mechanism     | Tool, technique, or method used to exploit the weakness |
| Pathway       | Route used to reach the vulnerability                   |

---

# Example 1: Malware Through Email

### Scenario

Diego receives an email that appears to come from a colleague.

The email contains a document attachment.

When Diego opens the document, malware is installed on his computer.

### Attack Vector Analysis

| Component     | Example                      |
| ------------- | ---------------------------- |
| Vulnerability | Diego (human trust)          |
| Mechanism     | Malware + social engineering |
| Pathway       | Email                        |

---

# Example 2: Server Room Intrusion

### Scenario

A technician claims she forgot her access badge.

An employee allows her into a restricted server room.

She secretly inserts a USB device into a server, installing malware.

### Attack Vector Analysis

| Component     | Example                               |
| ------------- | ------------------------------------- |
| Vulnerability | Helpful employee and unsecured server |
| Mechanism     | Social engineering + malware          |
| Pathway       | Door access and USB device            |

---

# Types of Attack Vectors

Attack vectors generally fall into three categories:

## 1. Electronic Social Engineering

Uses digital communication to manipulate victims.

Examples:

* Phishing emails
* Smishing (SMS phishing)
* Vishing (voice phishing)

---

## 2. Physical Social Engineering

Uses physical interaction to gain access.

Examples:

* Tailgating
* Impersonation
* Fake technicians
* Shoulder surfing

---

## 3. Technical Attacks

Exploit technological weaknesses.

Examples:

* Software vulnerabilities
* Misconfigurations
* Weak passwords
* Unpatched systems

---

# What is an Attack Path?

An **Attack Path** is the complete chain of events an attacker follows to achieve their objective.

### Example

1. Send phishing email
2. Victim downloads malware
3. Malware installs backdoor
4. Attacker gains access
5. Data is stolen

This entire sequence is known as the attack path.

---

# Main Categories of Cybersecurity Threats

Cybersecurity threats are commonly divided into four major categories:

1. Social Engineering
2. Malware
3. Unauthorized Access
4. System Design Failure

---

# 1. Social Engineering

## Definition

Social engineering is the use of psychological manipulation to trick people into performing actions that benefit the attacker.

### Goal

* Steal information
* Gain access
* Install malware
* Bypass security controls

### Key Ingredients

Successful social engineering usually requires:

1. Gaining trust
2. Creating urgency

---

## Examples

* Phishing
* Spear Phishing
* Whale Phishing
* Vishing
* Smishing
* Fake technical support scams

---

# 2. Malware

## Definition

Malware (Malicious Software) is software designed to:

* Damage systems
* Disrupt operations
* Steal information
* Gain unauthorized access

---

## Common Types of Malware

| Malware Type | Purpose                           |
| ------------ | --------------------------------- |
| Virus        | Infect files and spread           |
| Worm         | Self-replicates across networks   |
| Trojan Horse | Disguised as legitimate software  |
| Ransomware   | Encrypts data and demands payment |
| Spyware      | Secretly collects information     |

---

# 3. Unauthorized Access

Unauthorized access occurs when attackers gain access to physical or digital resources without permission.

---

## Physical Unauthorized Access

Examples:

* Tailgating
* Breaking into restricted areas
* Fake maintenance workers

### Tailgating

Tailgating occurs when an attacker follows an authorized person through a secured entrance.

---

## Digital Unauthorized Access

Examples:

* Stolen credentials
* Shoulder surfing
* Brute-force attacks
* Credential theft

---

# 4. System Design Failure

## Definition

A security weakness or flaw in the design of software, hardware, or systems.

Attackers exploit these flaws to gain unauthorized access.

---

## Examples

* Software bugs
* Weak encryption
* Poor security architecture
* Vulnerable applications

---

# Common Attack Vectors

## Phishing

Tricks users into revealing sensitive information or installing malware.

### Purpose

* Credential theft
* Malware installation
* Initial network access

### Weakness Exploited

Human trust

---

## Spear Phishing

Targets a specific individual or organization.

More personalized and difficult to detect.

---

## Whale Phishing

Targets high-ranking executives.

### Common Targets

* CEO
* CFO
* Executives
* Senior managers

These individuals often possess privileged access to critical systems.

---

# Trojan Horse Attack

## Definition

A Trojan Horse is malware disguised as legitimate software or files.

### How It Works

1. Victim opens attachment.
2. File appears harmless.
3. Malware installs silently.
4. Attacker gains access.

### Important Fact

The Trojan itself is often only the first stage of a larger attack.

---

# DDoS Attack

## Distributed Denial-of-Service (DDoS)

A DDoS attack floods a target with traffic from thousands of compromised systems.

### Goal

Make services unavailable to legitimate users.

---

## How a DDoS Attack Works

### Step 1

Attacker sends phishing emails.

### Step 2

Victims install malware.

### Step 3

Computers become part of a botnet.

### Step 4

Command and Control (C&C) server issues commands.

### Step 5

Thousands of infected systems attack the target simultaneously.

---

# Pre-Exploit vs Post-Exploit Attacks

Understanding this distinction is important for cybersecurity professionals.

---

## Pre-Exploit Attacks

Used to gain initial access.

### Examples

* Phishing
* Spear phishing
* Whale phishing
* Brute force attacks
* Social engineering

### Goal

Gain a foothold in the system.

---

## Post-Exploit Attacks

Used after access has been obtained.

### Examples

* Ransomware
* DDoS
* Trojan deployment
* Data exfiltration

### Goal

Achieve the attacker's final objective.

---

# Birthday Attack

## Definition

A cryptographic attack that exploits weaknesses in certain hashing algorithms.

### Target

* Password storage systems
* Hashing functions

### Goal

Find hash collisions and compromise protected information.

---

# Brute Force Attack

## Definition

An attack that attempts every possible password combination until the correct one is found.

### Success Depends On

* Weak passwords
* Poor password policies

### Defense

Implement:

* Strong passwords
* Account lockout policies
* Multi-factor authentication (MFA)

---

# Key Terms

| Term                 | Definition                                         |
| -------------------- | -------------------------------------------------- |
| Cybersecurity Threat | Action exploiting a vulnerability to cause harm    |
| Attack Vector        | Method used to exploit a vulnerability             |
| Vulnerability        | Weakness in a system, process, or person           |
| Attack Path          | Chain of attack events                             |
| Social Engineering   | Psychological manipulation of people               |
| Malware              | Malicious software                                 |
| Tailgating           | Following an authorized person into a secure area  |
| Trojan Horse         | Malware disguised as legitimate software           |
| DDoS                 | Distributed Denial-of-Service attack               |
| Whale Phishing       | Phishing attack targeting executives               |
| Birthday Attack      | Attack exploiting weaknesses in hashing algorithms |
| Brute Force Attack   | Trying every password combination until successful |

---

# Attack Vector Summary

| Attack Vector   | Category             | Purpose                     |
| --------------- | -------------------- | --------------------------- |
| Phishing        | Social Engineering   | Credential theft            |
| Spear Phishing  | Social Engineering   | Targeted compromise         |
| Whale Phishing  | Social Engineering   | Executive compromise        |
| Trojan Horse    | Malware              | Hidden malware installation |
| DDoS            | Availability Attack  | Service disruption          |
| Tailgating      | Physical Access      | Unauthorized entry          |
| Birthday Attack | Cryptographic Attack | Hash exploitation           |
| Brute Force     | Credential Attack    | Password guessing           |

---

# Key Takeaways

* Cybersecurity threats exploit vulnerabilities to cause harm.
* Attack vectors describe how attackers exploit weaknesses.
* Every attack vector includes a vulnerability, mechanism, and pathway.
* Cybersecurity threats fall into four major categories:

  * Social Engineering
  * Malware
  * Unauthorized Access
  * System Design Failure
* Attack paths often involve multiple attack vectors.
* Phishing is one of the most common pre-exploit attack methods.
* Trojan Horses, ransomware, and DDoS attacks are often used after initial compromise.
* Strong passwords and security awareness significantly reduce risk.

---

# Knowledge Check & Quiz Review

### Q1: What is a cybersecurity threat?

**Answer:** An action that exploits a vulnerability and causes harm to a system or network.

### Q2: What is an attack vector?

**Answer:** A method used by an attacker to exploit a vulnerability.

### Q3: What are the three components of an attack vector?

**Answer:** Vulnerability, Mechanism, and Pathway.

### Q4: What is an attack path?

**Answer:** The chain of events that occurs when attack vectors are exploited.

### Q5: What are the four main categories of cybersecurity threats?

**Answer:** Social Engineering, Malware, Unauthorized Access, and System Design Failure.

### Q6: What is tailgating?

**Answer:** Following an authorized person into a restricted area without permission.

### Q7: What is whale phishing?

**Answer:** A phishing attack targeting high-level executives such as CEOs or CFOs.

### Q8: What is a Trojan Horse?

**Answer:** Malware disguised as legitimate software or files.

### Q9: Is phishing a pre-exploit or post-exploit attack?

**Answer:** Pre-exploit attack.

### Q10: What is a brute-force attack?

**Answer:** Attempting every possible password combination until the correct one is found.

---

# Exam Tips

### Memorize the Four Threat Categories

**S-M-U-S**

* Social Engineering
* Malware
* Unauthorized Access
* System Design Failure

### Remember the Attack Vector Formula

**Attack Vector = Vulnerability + Mechanism + Pathway**

### Commonly Tested Topics

* Phishing
* Spear Phishing
* Whale Phishing
* Trojan Horse
* DDoS
* Tailgating
* Brute Force Attacks
* Birthday Attacks

---

# Summary

Cybersecurity threats are actions that exploit vulnerabilities to damage systems, steal information, or disrupt services. Threat actors use attack vectors such as phishing, malware, tailgating, brute-force attacks, and DDoS attacks to achieve their goals. Understanding attack vectors, attack paths, and the four major threat categories helps security professionals identify risks, strengthen defenses, and protect organizational assets from cyberattacks.
