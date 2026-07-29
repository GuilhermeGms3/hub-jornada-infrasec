# Module 2: The Threat Landscape

## Lesson 05: Attack Frameworks

---

# Overview

As cyberattacks have become more advanced, security professionals have developed attack frameworks to better understand, analyze, and defend against them.

Attack frameworks provide a structured way to:

* Understand attacker behavior
* Analyze attack stages
* Identify vulnerabilities
* Improve incident response
* Strengthen security defenses

Two of the most important cybersecurity frameworks are:

1. Cyber Kill Chain (Lockheed Martin)
2. MITRE ATT&CK Framework

These frameworks are widely used across the cybersecurity industry and are important concepts for NSE certification exams.

---

# Learning Objectives

After completing this lesson, you should be able to:

* Define attack frameworks.
* Explain Advanced Persistent Threats (APTs).
* Describe the Cyber Kill Chain.
* Identify the seven stages of the Cyber Kill Chain.
* Explain the limitations of the Cyber Kill Chain.
* Understand the MITRE ATT&CK framework.
* Describe the benefits of MITRE ATT&CK.

---

# What are Attack Frameworks?

Attack frameworks are structured models used to:

* Analyze cyberattacks
* Understand attacker behavior
* Improve detection capabilities
* Develop defensive strategies
* Strengthen organizational security posture

### Why Are They Important?

Attack frameworks help security teams answer questions such as:

* How do attackers operate?
* What stage is an attack currently in?
* What defenses should be implemented?
* How can attacks be detected earlier?

---

# Advanced Persistent Threats (APTs)

## What is an APT?

An **Advanced Persistent Threat (APT)** is a highly sophisticated cyberattack that involves:

* Long-term planning
* Continuous surveillance
* Multiple attack stages
* Persistent access to systems

### Characteristics of APTs

| Characteristic | Description                   |
| -------------- | ----------------------------- |
| Advanced       | Uses sophisticated techniques |
| Persistent     | Maintains long-term access    |
| Targeted       | Focuses on specific victims   |
| Stealthy       | Avoids detection              |

### Common Targets

* Governments
* Military organizations
* Critical infrastructure
* Large corporations

---

# Cyber Kill Chain

## What is the Cyber Kill Chain?

The **Cyber Kill Chain** is a cybersecurity framework developed by **Lockheed Martin** in 2011.

It describes the stages attackers follow during a cyberattack.

### Purpose

* Understand attack progression
* Detect attacks earlier
* Interrupt attacks before damage occurs

---

# The Seven Stages of the Cyber Kill Chain

```text
Reconnaissance
      ↓
Weaponization
      ↓
Delivery
      ↓
Exploitation
      ↓
Installation
      ↓
Command & Control
      ↓
Exfiltration
```

---

# Stage 1: Reconnaissance

## Definition

The attacker gathers information about the target.

### Activities

* Research organization websites
* Analyze social media profiles
* Gather employee information
* Identify vulnerabilities
* Scan networks

### Goal

Understand the target and identify weaknesses.

### Example

An attacker searches employee LinkedIn profiles to identify IT administrators.

---

# Stage 2: Weaponization

## Definition

The attacker creates a malicious payload.

### Activities

* Develop malware
* Create viruses
* Build Trojan Horses
* Prepare phishing attachments

### Example

An attacker embeds malware inside a Microsoft Word document.

### Goal

Prepare a weapon that can compromise the target.

---

# Stage 3: Delivery

## Definition

The attacker delivers the malicious payload to the victim.

### Common Delivery Methods

* Phishing emails
* Malicious websites
* USB devices
* Exploit kits

### Example

A phishing email containing an infected Word document is sent to an employee.

### Goal

Get the payload into the target environment.

---

# Stage 4: Exploitation

## Definition

The payload executes and exploits a vulnerability.

### Activities

* Execute malicious code
* Exploit software vulnerabilities
* Gain unauthorized access

### Example

The employee opens the infected document and malware executes.

### Goal

Compromise the target system.

---

# Stage 5: Installation

## Definition

The attacker establishes persistent access.

### Activities

* Install malware
* Deploy rootkits
* Create backdoors

### Example

A rootkit is installed to maintain long-term access.

### Goal

Ensure continued access even if initial malware is removed.

---

# Stage 6: Command and Control (C&C)

## Definition

The attacker establishes communication with compromised systems.

### Activities

* Connect infected devices to a C&C server
* Receive attacker commands
* Download additional malware

### Example

An infected computer communicates with an external command-and-control server.

### Goal

Allow remote control of compromised systems.

---

# Stage 7: Exfiltration

## Definition

The attacker extracts valuable data or achieves their objective.

### Activities

* Steal sensitive information
* Transfer files
* Launch additional attacks

### Example

Customer records are copied to an external server.

### Goal

Complete the attacker's mission.

---

# Cyber Kill Chain Summary

| Stage             | Purpose                         |
| ----------------- | ------------------------------- |
| Reconnaissance    | Gather information              |
| Weaponization     | Create malicious payload        |
| Delivery          | Send payload to target          |
| Exploitation      | Execute attack                  |
| Installation      | Maintain access                 |
| Command & Control | Control compromised systems     |
| Exfiltration      | Steal data or achieve objective |

---

# Limitations of the Cyber Kill Chain

Although highly valuable, the Cyber Kill Chain has limitations.

## Limitation 1: External Attack Assumption

The framework assumes attacks originate outside the network.

### Problem

Not all attacks are external.

Examples:

* Insider threats
* Disgruntled employees
* Privileged misuse

---

## Limitation 2: Traditional Security Focus

The framework primarily focuses on perimeter-based defenses.

Modern attacks often:

* Use cloud environments
* Target identities
* Abuse legitimate tools

---

## Result

New frameworks were developed to address these limitations.

The most important of these is MITRE ATT&CK.

---

# MITRE ATT&CK Framework

## What is MITRE ATT&CK?

MITRE ATT&CK stands for:

### Adversarial Tactics, Techniques, and Common Knowledge

It was introduced in 2013 by the **MITRE Corporation**.

---

# Purpose of MITRE ATT&CK

MITRE ATT&CK provides:

* A common language for cybersecurity
* Detailed attacker behavior information
* Threat intelligence knowledge
* Defensive guidance

Unlike the Cyber Kill Chain, MITRE ATT&CK is continuously updated.

---

# MITRE ATT&CK Structure

The framework organizes attacker behavior into:

## Tactics

High-level attacker goals.

Examples:

* Initial Access
* Execution
* Persistence
* Privilege Escalation
* Defense Evasion

---

## Techniques

Specific methods used to accomplish tactics.

Example:

### Tactic

Initial Access

### Technique

Phishing

---

## Procedures

Real-world implementation of techniques by threat actors.

---

# TTPs

MITRE ATT&CK focuses heavily on:

### Tactics

### Techniques

### Procedures

Commonly abbreviated as:

**TTPs**

### Why TTPs Matter

Understanding TTPs helps defenders:

* Predict attacker behavior
* Detect attacks earlier
* Build stronger defenses

---

# Benefits of MITRE ATT&CK

MITRE ATT&CK offers several advantages.

---

## 1. Common Language

Provides standardized terminology.

### Benefit

Organizations can communicate more effectively about threats.

---

## 2. Better Threat Analysis

Helps analysts understand attacker behavior.

### Benefit

Improved threat hunting and incident response.

---

## 3. Prioritization of Risks

Organizations can map threats to ATT&CK techniques.

### Benefit

Focus resources on the highest-risk threats.

---

## 4. Improved Security Controls

Security teams can build defenses against specific techniques.

### Benefit

More targeted protection.

---

## 5. Continuous Updates

MITRE ATT&CK evolves with the threat landscape.

### Benefit

Remains relevant against modern attacks.

---

# Cyber Kill Chain vs MITRE ATT&CK

| Feature    | Cyber Kill Chain              | MITRE ATT&CK                |
| ---------- | ----------------------------- | --------------------------- |
| Created By | Lockheed Martin               | MITRE Corporation           |
| Released   | 2011                          | 2013                        |
| Focus      | Attack stages                 | Attacker behavior           |
| Structure  | 7-step process                | Tactics & Techniques        |
| Updates    | Relatively static             | Continuously updated        |
| Strength   | Understand attack progression | Understand attacker methods |
| Limitation | Focus on external attacks     | More complex to learn       |

---

# Key Terms

| Term                    | Definition                             |
| ----------------------- | -------------------------------------- |
| Attack Framework        | Structured model for analyzing attacks |
| APT                     | Advanced Persistent Threat             |
| Cyber Kill Chain        | Seven-stage attack framework           |
| Reconnaissance          | Information gathering stage            |
| Weaponization           | Creation of malicious payload          |
| Delivery                | Sending payload to target              |
| Exploitation            | Executing the attack                   |
| Installation            | Establishing persistence               |
| Command & Control (C&C) | Remote attacker communication          |
| Exfiltration            | Data theft or objective completion     |
| MITRE ATT&CK            | Framework documenting attacker TTPs    |
| TTPs                    | Tactics, Techniques, and Procedures    |

---

# Key Takeaways

* Attack frameworks help organizations understand and defend against cyberattacks.
* Advanced Persistent Threats (APTs) are long-term, sophisticated attacks.
* The Cyber Kill Chain describes seven stages of an attack.
* Detecting attacks early in the kill chain reduces damage.
* MITRE ATT&CK focuses on attacker tactics and techniques.
* MITRE ATT&CK provides a common language for cybersecurity professionals.
* ATT&CK is continuously updated to reflect modern threats.
* Both frameworks are widely used in cybersecurity operations.

---

# Knowledge Check & Quiz Review

### Q1: What is an Advanced Persistent Threat (APT)?

**Answer:** A sophisticated, long-term cyberattack that maintains persistent access to a target.

### Q2: Who developed the Cyber Kill Chain?

**Answer:** Lockheed Martin.

### Q3: What is the first stage of the Cyber Kill Chain?

**Answer:** Reconnaissance.

### Q4: What happens during weaponization?

**Answer:** The attacker creates a malicious payload or exploit.

### Q5: What is the purpose of the installation stage?

**Answer:** To establish persistent access to compromised systems.

### Q6: What does C&C stand for?

**Answer:** Command and Control.

### Q7: What is the final stage of the Cyber Kill Chain?

**Answer:** Exfiltration.

### Q8: What does ATT&CK stand for?

**Answer:** Adversarial Tactics, Techniques, and Common Knowledge.

### Q9: What are TTPs?

**Answer:** Tactics, Techniques, and Procedures.

### Q10: Which framework is continuously updated?

**Answer:** MITRE ATT&CK.

---

# Exam Tips

## Memorize the Cyber Kill Chain

### Easy Memory Trick

**R-W-D-E-I-C-E**

* Reconnaissance
* Weaponization
* Delivery
* Exploitation
* Installation
* Command & Control
* Exfiltration

---

## Remember

### Cyber Kill Chain

Focuses on:

**Attack Stages**

### MITRE ATT&CK

Focuses on:

**Attacker Tactics & Techniques**

---

## Frequently Tested Topics

* Advanced Persistent Threats (APTs)
* Cyber Kill Chain stages
* Reconnaissance
* Weaponization
* Command & Control
* Exfiltration
* MITRE ATT&CK
* TTPs
* Benefits of ATT&CK

---

# Summary

Attack frameworks provide structured methods for understanding, analyzing, and defending against cyberattacks. The Cyber Kill Chain breaks an attack into seven stages, from reconnaissance to exfiltration, helping organizations detect and stop attacks early. MITRE ATT&CK expands on this concept by documenting attacker tactics, techniques, and procedures (TTPs), offering a continuously updated knowledge base that enables organizations to better understand threats, improve defenses, and strengthen their overall security posture.
