# Module 2: The Threat Landscape

## Lesson 02: Threat Actors

---

## Overview

Threat actors (also called bad actors) are individuals or groups that attempt to steal, damage, disrupt, or gain unauthorized access to computer systems, networks, and data.

Not all threat actors are the same. They have different motivations, goals, resources, and attack methods. Understanding who is attacking and why helps cybersecurity professionals predict attacks and build stronger defenses.

---

# Learning Objectives

After completing this lesson, you should be able to:

* Describe different types of threat actors and their motivations.
* Understand common attack methods used by threat actors.
* Identify different categories of hackers.
* Explain how phishing, botnets, DDoS attacks, ransomware, and zero-day exploits are used.

---

# What is a Threat Actor?

A **Threat Actor (Bad Actor)** is any person or group that attempts to:

* Steal information
* Damage systems
* Disrupt services
* Gain unauthorized access
* Prevent legitimate users from accessing resources

### Important Note

A threat actor can be anyone:

* A hacker in another country
* A disgruntled employee
* A scammer operating from a call center
* Someone running a fake Wi-Fi hotspot
* A curious teenager experimenting with hacking tools

Cyber threats can come from both outside and inside an organization.

---

# Types of Threat Actors

Fortinet groups threat actors into five major categories:

1. Explorer
2. Hacktivist
3. Cyberterrorist
4. Cybercriminal
5. Cyberwarrior

---

# 1. Explorer

## Motivation

**Curiosity and recognition (notoriety)**

Explorers are often interested in discovering vulnerabilities and proving their technical skills.

### Characteristics

* Curious about system weaknesses
* Want recognition and attention
* Usually do not intend serious harm
* May deface websites to show off their skills

### Common Activities

* Website defacement
* Security testing without permission
* Exploring vulnerabilities
* Basic phishing attacks

### Example

An explorer discovers a vulnerable website and changes the homepage to display their name or hacker alias.

---

# Phishing Attacks

One common technique used by explorers and many other threat actors is **phishing**.

## What is Phishing?

Phishing is a social engineering attack that tricks users into revealing sensitive information.

Examples:

* Usernames
* Passwords
* Credit card details
* Banking information

### Requirements for Successful Phishing

1. Gain the victim's trust.
2. Create a sense of urgency or emergency.

---

## Phishing Example

A victim receives an email claiming their account will be suspended immediately.

The email contains a login link.

Instead of directing the user to the legitimate website, the link leads to a fake website that looks identical to the real one.

The victim enters:

* Username
* Password

The attacker steals the credentials and gains access to the account.

---

## Types of Phishing

| Type           | Description                        |
| -------------- | ---------------------------------- |
| Phishing       | Sent to many people                |
| Spear Phishing | Targets a specific person or group |
| Smishing       | Phishing through SMS/text messages |
| Vishing        | Phishing through voice calls       |

---

# 2. Hacktivist

## Motivation

**Political, social, or ideological beliefs**

Hacktivists use cyberattacks to support a cause or protest against organizations they oppose.

### Characteristics

* Driven by ideology
* Operate in groups
* Usually anonymous
* Target governments, corporations, and organizations

### Common Targets

* Political organizations
* Government agencies
* Corporations
* Social groups

---

## Botnets

Hacktivists frequently use botnets.

### What is a Botnet?

A botnet is a collection of compromised computers controlled remotely by an attacker.

Each infected device is called a **bot** or **zombie**.

---

## Command and Control (C&C) Server

A **Command and Control (C&C) Server** is the central system used to control botnet devices.

Process:

1. Attacker creates malware.
2. Malware infects thousands of computers.
3. Infected computers connect to the C&C server.
4. Attacker sends commands through the C&C server.
5. All infected systems perform the attack simultaneously.

---

## DDoS Attack

### What is a DDoS Attack?

**Distributed Denial-of-Service (DDoS)** is an attack where thousands of systems flood a target with traffic.

Result:

* Server becomes overloaded.
* Legitimate users cannot access services.
* Website or application becomes unavailable.

### Example

A hacktivist group uses a botnet containing 50,000 infected computers to overwhelm a company's website.

---

# 3. Cyberterrorist

## Motivation

**Fear, disruption, and societal destabilization**

Cyberterrorists seek to damage critical systems and create widespread disruption.

### Characteristics

* Ideologically motivated
* Highly organized
* Operate like virtual armies
* Target critical infrastructure

---

## Common Targets

* Nuclear power plants
* Power grids
* Water treatment facilities
* Natural gas pipelines
* Communication systems

---

## Operational Technology (OT)

### What is OT?

Operational Technology refers to systems that control physical industrial processes.

Examples:

* Electrical grids
* Manufacturing plants
* Transportation systems
* Industrial control systems

Cyberterrorists often target OT systems because disruption can affect entire societies.

---

## Common Attack Methods

* Spear phishing
* Social engineering
* DDoS attacks
* Malware deployment

### Example

A cyberterrorist identifies a network administrator with privileged access and launches a highly targeted spear-phishing campaign.

---

# 4. Cybercriminal

## Motivation

**Financial gain**

Cybercriminals are primarily interested in making money.

### Common Activities

* Identity theft
* Credit card theft
* Online fraud
* Phishing scams
* Selling stolen data
* Ransomware attacks

---

## Ransomware

### What is Ransomware?

Ransomware is malware that:

* Encrypts files
* Blocks access to systems
* Demands payment to restore access

### Example

A hospital's systems become encrypted.

Attackers demand payment in cryptocurrency before restoring access.

---

# 5. Cyberwarrior

## Motivation

**National interests**

Cyberwarriors operate on behalf of nation-states.

They are often government-sponsored and have access to significant resources.

### Why Are They Dangerous?

Because they have:

* Large budgets
* Skilled researchers
* Advanced technology
* Intelligence support

---

## Common Activities

* Espionage
* Surveillance
* Data theft
* Infrastructure attacks
* Cyber warfare
* Political influence operations

---

## Zero-Day Exploits

### What is a Zero-Day Vulnerability?

A software vulnerability unknown to the vendor.

### What is a Zero-Day Exploit?

An attack that takes advantage of a vulnerability before a patch is available.

The vendor has **zero days** to prepare a fix once the vulnerability becomes public.

### Why Are Zero-Day Exploits Dangerous?

* No immediate protection exists.
* Traditional security tools may not detect them.
* Nation-state attackers frequently use them.

---

# Real-World Example: Colonial Pipeline Attack (2021)

The Colonial Pipeline cyberattack demonstrated how different threat actor groups may cooperate.

Possible motivations included:

* Financial gain (Cybercriminals)
* National interests (Cyberwarriors)

This shows that threat actor categories can sometimes overlap.

---

# Key Terms

| Term                        | Definition                                            |
| --------------------------- | ----------------------------------------------------- |
| Threat Actor                | Individual or group conducting cyberattacks           |
| Phishing                    | Fraudulent attempt to steal sensitive information     |
| Spear Phishing              | Targeted phishing attack against specific individuals |
| Smishing                    | Phishing through text messages                        |
| Vishing                     | Phishing through voice calls                          |
| Botnet                      | Network of infected devices controlled by an attacker |
| C&C Server                  | Command-and-Control server managing botnets           |
| DDoS                        | Distributed Denial-of-Service attack                  |
| Operational Technology (OT) | Systems controlling industrial processes              |
| Ransomware                  | Malware that locks or encrypts data for payment       |
| Zero-Day Exploit            | Attack against an unknown vulnerability               |

---

# Threat Actor Comparison

| Threat Actor   | Motivation          | Common Attacks               |
| -------------- | ------------------- | ---------------------------- |
| Explorer       | Curiosity, Fame     | Website defacement, phishing |
| Hacktivist     | Ideology            | Botnets, DDoS attacks        |
| Cyberterrorist | Fear and Disruption | Spear phishing, OT attacks   |
| Cybercriminal  | Money               | Ransomware, fraud, phishing  |
| Cyberwarrior   | National Interests  | Espionage, zero-day exploits |

---

# Key Takeaways

* Threat actors have different motivations and goals.
* Understanding attacker behavior improves defensive strategies.
* Phishing remains one of the most common attack methods.
* Botnets are often used to launch DDoS attacks.
* Cybercriminals focus on financial gain.
* Cyberterrorists target critical infrastructure.
* Cyberwarriors are often government-sponsored and use advanced attack techniques.
* Zero-day exploits are among the most dangerous cyber threats.

---

# Knowledge Check & Quiz Review

### Q1: What is a threat actor?

**Answer:** A person or group that attempts to steal, damage, disrupt, or gain unauthorized access to systems and data.

### Q2: Which threat actor is primarily motivated by curiosity and recognition?

**Answer:** Explorer.

### Q3: What is phishing?

**Answer:** A social engineering attack designed to trick users into revealing sensitive information.

### Q4: What is spear phishing?

**Answer:** A phishing attack targeting a specific individual or organization.

### Q5: What is a botnet?

**Answer:** A network of infected computers controlled remotely by an attacker.

### Q6: What does DDoS stand for?

**Answer:** Distributed Denial-of-Service.

### Q7: Which threat actor is mainly motivated by financial gain?

**Answer:** Cybercriminal.

### Q8: What is ransomware?

**Answer:** Malware that encrypts data or blocks access until a ransom is paid.

### Q9: Which threat actor is usually sponsored by a nation-state?

**Answer:** Cyberwarrior.

### Q10: What is a zero-day exploit?

**Answer:** An attack that exploits a vulnerability before a patch becomes available.

---

# Exam Tips

### Remember the Motivations

| Threat Actor   | Motivation         |
| -------------- | ------------------ |
| Explorer       | Fame & Curiosity   |
| Hacktivist     | Ideology           |
| Cyberterrorist | Fear & Disruption  |
| Cybercriminal  | Money              |
| Cyberwarrior   | National Interests |

### Easy Memory Trick

**F-I-F-M-N**

* Fame → Explorer
* Ideology → Hacktivist
* Fear → Cyberterrorist
* Money → Cybercriminal
* Nation → Cyberwarrior

### Frequently Tested Terms

* Phishing
* Spear Phishing
* Smishing
* Vishing
* Botnet
* DDoS
* Ransomware
* Zero-Day Exploit

---

# Summary

Threat actors are individuals or groups that conduct malicious cyber activities. They can be classified as Explorers, Hacktivists, Cyberterrorists, Cybercriminals, or Cyberwarriors based on their motivations and attack methods. Understanding these actors, their goals, and the techniques they use is essential for identifying threats, improving defenses, and protecting critical systems from cyberattacks.
