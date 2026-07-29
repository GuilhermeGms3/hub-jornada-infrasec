# Module 2: The Threat Landscape

## Lesson 04: Threat Intelligence

---

# Overview

Threat Intelligence (TI) is one of the most important concepts in modern cybersecurity. Organizations collect, analyze, and share threat intelligence to identify potential threats before they cause damage.

Threat intelligence helps security teams make informed decisions, prioritize risks, detect attacks earlier, and improve overall security posture.

---

# Learning Objectives

After completing this lesson, you should be able to:

* Define Threat Intelligence (TI).
* Explain the three characteristics of threat intelligence.
* Identify internal and external sources of threat intelligence.
* Understand threat intelligence standards such as STIX and TAXII.
* Explain the threat intelligence lifecycle.
* Recognize the role of OSINT, CVSS, and MITRE ATT&CK in threat intelligence.

---

# What is Threat Intelligence?

According to Gartner:

> Threat Intelligence is evidence-based knowledge, including context, mechanisms, indicators, implications, and actionable advice about existing or emerging threats that can help organizations make informed security decisions.

### Simple Definition

Threat Intelligence is:

> Information about cyber threats that helps organizations understand, prepare for, and respond to attacks.

---

# Three Characteristics of Threat Intelligence

For information to qualify as threat intelligence, it must be:

1. Relevant
2. Actionable
3. Contextual

Without all three characteristics, information is simply data—not intelligence.

---

# 1. Relevant

Threat intelligence must be relevant to the organization.

### Example

Suppose a new malware variant targets **macOS** systems.

If your organization only uses **Windows** devices:

* The information may be interesting.
* It is not directly relevant.
* Therefore, it is not useful threat intelligence for your organization.

### Key Idea

Threat intelligence should relate to:

* Your systems
* Your business sector
* Your technologies
* Your threat environment

---

# 2. Actionable

Threat intelligence must allow security teams to take action.

### Example

Information:

> "Dynamite Panda has launched attacks against hospitals."

This information alone is not actionable.

However, if the report also provides:

* Indicators of Compromise (IoCs)
* Attack methods
* Malware signatures
* Detection techniques

Then security teams can use that information to defend their systems.

### Key Idea

Threat intelligence should help answer:

> "What can we do about this threat?"

---

# 3. Contextual

Threat intelligence must provide enough background information to assess risk.

### Example

A vulnerability affecting macOS devices may initially appear dangerous.

However:

* Asset inventory shows no macOS devices.
* Therefore, risk is minimal.

The additional context transforms information into meaningful intelligence.

### Key Idea

Context helps organizations determine:

* How serious the threat is
* Whether they are affected
* What actions should be taken

---

# Threat Intelligence Formula

## Easy Exam Memory Trick

### Threat Intelligence =

**Relevant + Actionable + Contextual**

If one element is missing, it is generally not considered useful threat intelligence.

---

# Sources of Threat Intelligence

Threat intelligence comes from two main sources:

1. Internal Sources
2. External Sources

---

# Internal Sources

Internal intelligence is generated within the organization.

### Examples

* Server logs
* Firewall logs
* Router logs
* IDS/IPS logs
* Incident reports
* Security audits
* Penetration test results
* Captured network traffic

---

## Benefits

Internal data provides insight into:

* Attacks targeting your organization
* Security weaknesses
* Historical incidents
* Network behavior

---

# External Sources

External intelligence comes from outside organizations.

### Examples

* Government agencies
* Security vendors
* Research organizations
* Threat-sharing communities

---

# Government Sources

Common government sources include:

* Department of Homeland Security (DHS)
* Federal Bureau of Investigation (FBI)
* National Institute of Standards and Technology (NIST)

These organizations publish:

* Security advisories
* Vulnerability alerts
* Ransomware guidance
* Threat reports

---

# Private Sources

Private organizations also provide threat intelligence.

### Examples

* SANS Institute
* FortiGuard Labs

---

## FortiGuard

FortiGuard is Fortinet's research and threat intelligence service.

### Provides

* Malware analysis
* Threat reports
* Vulnerability information
* Threat severity ratings

### Benefits

Organizations can prioritize security efforts based on threat severity.

---

# Open-Source Intelligence (OSINT)

## What is OSINT?

OSINT (Open-Source Intelligence) refers to publicly available information used for intelligence gathering.

### Sources

* Public databases
* Websites
* Research reports
* Security feeds
* Vulnerability databases

### Benefits

* Free
* Widely accessible
* Frequently updated

---

# Common Vulnerability Scoring System (CVSS)

## What is CVSS?

CVSS (Common Vulnerability Scoring System) is an industry-standard framework used to assess vulnerability severity.

---

## CVSS Scoring Range

| Score      | Severity |
| ---------- | -------- |
| 0.0        | None     |
| 0.1 – 3.9  | Low      |
| 4.0 – 6.9  | Medium   |
| 7.0 – 8.9  | High     |
| 9.0 – 10.0 | Critical |

---

## Factors Considered

CVSS evaluates:

* Exploitability
* Impact
* Complexity
* Availability of mitigations

### Purpose

Helps organizations prioritize vulnerabilities based on risk.

---

# MITRE ATT&CK

## What is MITRE ATT&CK?

MITRE ATT&CK is a publicly available knowledge base documenting:

* Attacker tactics
* Techniques
* Procedures (TTPs)

---

## Benefits

* Understand attacker behavior
* Threat hunting
* Security monitoring
* Incident response
* Defensive planning

MITRE ATT&CK is one of the most valuable cyber threat intelligence resources available today.

---

# Threat Intelligence Sharing

Many organizations share threat intelligence with one another.

### Example

Banks in Brazil share cyber threat information to improve collective defense.

### Benefits

* Faster threat detection
* Improved collaboration
* Better incident response
* Stronger industry security

---

# Threat Intelligence Standards

The cybersecurity community uses standardized formats to exchange intelligence efficiently.

Two important standards are:

1. STIX
2. TAXII

---

# STIX

## Structured Threat Information Expression (STIX)

STIX is a standardized language used to describe cyber threat information.

---

## STIX Can Describe

* Threat actors
* Indicators of Compromise (IoCs)
* Malware
* Vulnerabilities
* Incidents
* Attack techniques
* Mitigation recommendations

---

## Benefits

STIX allows organizations to share threat intelligence in a consistent format.

---

# TAXII

## Trusted Automated Exchange of Indicator Information (TAXII)

TAXII is a protocol used to exchange cyber threat intelligence.

---

## How TAXII Works

TAXII uses:

* HTTPS
* REST APIs

To automate the sharing of cyber threat intelligence.

---

## Benefits

* Standardized sharing
* Automated communication
* Easier collaboration
* Eliminates custom integrations

---

# STIX vs TAXII

| Feature  | STIX                          | TAXII                         |
| -------- | ----------------------------- | ----------------------------- |
| Purpose  | Describes threat intelligence | Transfers threat intelligence |
| Type     | Data format/language          | Communication protocol        |
| Function | Defines information structure | Exchanges information         |
| Example  | Threat reports                | Threat sharing system         |

### Easy Exam Tip

**STIX Stores Intelligence**

**TAXII Transports Intelligence**

---

# Threat Intelligence Lifecycle

Collecting intelligence is only the beginning.

Organizations must process intelligence effectively.

The Threat Intelligence Lifecycle consists of six steps.

---

# Step 1: Identify Primary Threats

Determine the threats most relevant to the organization.

### Examples

#### Hospital

Likely concerns:

* Ransomware
* Patient data theft

#### Department of Defense

Likely concerns:

* Espionage
* Data exfiltration

---

# Step 2: Collect Information

Gather intelligence from:

### Internal Sources

* Logs
* Incident reports
* Monitoring systems

### External Sources

* NIST
* CVSS
* MITRE ATT&CK
* FortiGuard
* SANS

---

# Step 3: Process Information

Organize and filter data.

### Activities

* Remove irrelevant information
* Identify patterns
* Establish network baselines
* Detect abnormal behavior

### Goal

Separate useful signals from noise.

---

# Step 4: Analyze Information

Analyze processed data for:

### Indicators of Compromise (IoCs)

Examples:

* Malicious IP addresses
* Suspicious domains
* Malware hashes
* Unauthorized accounts

---

# Step 5: Disseminate Intelligence

Share findings with:

* Security teams
* Business units
* Partners
* Threat-sharing communities

STIX and TAXII greatly assist this process.

---

# Step 6: Implement Lessons Learned

Use insights gained to improve security.

### Questions to Ask

* Have priorities changed?
* Are new threats emerging?
* Should monitoring methods change?
* Should defenses be strengthened?

---

# Continuous Improvement Loop

Threat intelligence is not a one-time activity.

The lifecycle repeats continuously:

```text
Identify Threats
      ↓
Collect Data
      ↓
Process Data
      ↓
Analyze
      ↓
Disseminate
      ↓
Improve Security
      ↓
Repeat
```

---

# Indicators of Compromise (IoCs)

## What is an IoC?

An Indicator of Compromise is evidence suggesting a system has been attacked or compromised.

### Examples

* Malicious IP addresses
* Suspicious files
* Malware hashes
* Unauthorized user accounts
* Unusual network traffic

---

# Key Terms

| Term                          | Definition                                              |
| ----------------------------- | ------------------------------------------------------- |
| Threat Intelligence           | Relevant, actionable, and contextual threat information |
| OSINT                         | Open-Source Intelligence                                |
| CVSS                          | Common Vulnerability Scoring System                     |
| MITRE ATT&CK                  | Knowledge base of attacker tactics and techniques       |
| STIX                          | Structured Threat Information Expression                |
| TAXII                         | Trusted Automated Exchange of Indicator Information     |
| IoC                           | Indicator of Compromise                                 |
| Threat Intelligence Lifecycle | Process used to collect and analyze threat intelligence |

---

# Key Takeaways

* Threat intelligence must be Relevant, Actionable, and Contextual.
* Information alone is not intelligence.
* Internal and external sources both contribute valuable intelligence.
* CVSS helps assess vulnerability severity.
* MITRE ATT&CK provides attacker behavior intelligence.
* STIX standardizes threat intelligence descriptions.
* TAXII standardizes threat intelligence sharing.
* Indicators of Compromise help detect attacks.
* Threat intelligence follows a continuous lifecycle process.

---

# Knowledge Check & Quiz Review

### Q1: What three characteristics must threat intelligence have?

**Answer:** Relevant, Actionable, and Contextual.

### Q2: What does CVSS stand for?

**Answer:** Common Vulnerability Scoring System.

### Q3: What is the purpose of CVSS?

**Answer:** To assess and rate vulnerability severity.

### Q4: What is OSINT?

**Answer:** Open-Source Intelligence gathered from publicly available sources.

### Q5: What does MITRE ATT&CK provide?

**Answer:** A knowledge base of attacker tactics, techniques, and procedures.

### Q6: What is STIX?

**Answer:** A standardized language used to describe cyber threat information.

### Q7: What is TAXII?

**Answer:** A protocol used to exchange cyber threat intelligence.

### Q8: What is an Indicator of Compromise (IoC)?

**Answer:** Evidence suggesting a system has been compromised.

### Q9: Which comes first in the Threat Intelligence Lifecycle?

**Answer:** Identify primary threats.

### Q10: Is threat intelligence a one-time process?

**Answer:** No, it is a continuous cycle.

---

# Exam Tips

### Most Important NSE Exam Concept

Threat Intelligence must be:

**Relevant + Actionable + Contextual**

Memorize this exactly.

### STIX vs TAXII

* **STIX = Describe Threat Intelligence**
* **TAXII = Share Threat Intelligence**

### CVSS Score Range

Remember:

**0 → 10**

* 0 = No Severity
* 10 = Critical Severity

### Commonly Tested Topics

* Threat Intelligence Characteristics
* Internal vs External Sources
* CVSS
* MITRE ATT&CK
* STIX
* TAXII
* Indicators of Compromise (IoCs)
* Threat Intelligence Lifecycle

---

# Summary

Threat Intelligence is evidence-based information that helps organizations understand, assess, and respond to cyber threats. For information to qualify as threat intelligence, it must be relevant, actionable, and contextual. Organizations gather intelligence from internal and external sources, use frameworks such as CVSS and MITRE ATT&CK to evaluate threats, and share intelligence using standards like STIX and TAXII. By following the Threat Intelligence Lifecycle, organizations can continuously improve their ability to detect, analyze, and defend against cyber threats.
