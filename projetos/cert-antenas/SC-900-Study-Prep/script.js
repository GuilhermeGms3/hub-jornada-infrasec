// Flashcard inline data (always loaded — fetch from JSON is tried first, this is the file:// fallback)
const FLASHCARD_INLINE = {
  "1-1": [
    {"q":"Shared Responsibility Model","a":"Framework defining customer vs cloud provider security responsibilities across on-premises, IaaS, PaaS, and SaaS"},
    {"q":"In IaaS, who manages the OS?","a":"The customer"},
    {"q":"In SaaS, who manages physical infrastructure?","a":"The cloud provider (Microsoft)"},
    {"q":"CIA triad","a":"Confidentiality, Integrity, Availability"},
    {"q":"Defense in Depth","a":"Layered security strategy using multiple controls at different levels"},
    {"q":"Zero Trust principles","a":"Verify explicitly, Use least privilege access, Assume breach"},
    {"q":"Seven pillars of Zero Trust","a":"Identities, Endpoints, Data, Apps, Infrastructure, Network, Visibility"},
    {"q":"Symmetric vs Asymmetric encryption","a":"Symmetric uses one shared key; Asymmetric uses a public/private key pair"},
    {"q":"What does hashing provide?","a":"Data integrity verification — any change produces a different hash"},
    {"q":"Data sovereignty","a":"Data is subject to the laws of the country where it is physically stored"},
    {"q":"Data residency","a":"The geographic location where data is stored"},
    {"q":"GRC","a":"Governance, Risk, and Compliance"},
    {"q":"AI Shared Responsibility Model","a":"Three layers: AI platform (provider secures infrastructure/models), AI application (customer secures prompts/data/logic), AI usage (customer governs acceptable use and mitigates prompt injection)"},
    {"q":"Salting","a":"Adding a unique random value to each password before hashing to prevent rainbow table attacks"},
    {"q":"Data privacy","a":"How data is collected, processed, used, and shared — covering transparency, consent, and individual rights (access, deletion, portability)"},
    {"q":"Customer always retains","a":"Data, identities, endpoints, and configuration choices regardless of cloud service model (IaaS, PaaS, SaaS)"},
    {"q":"Zero Trust pillars","a":"Identities, Devices, Applications, Data, Infrastructure, Networks, Visibility — seven foundational areas where Zero Trust principles must be applied"},
    {"q":"Symmetric encryption use case","a":"Bulk data encryption at rest (e.g., AES-256 for storage). Fast and efficient but key distribution is the main challenge"},
    {"q":"Asymmetric encryption use case","a":"TLS/SSL handshakes, digital signatures, secure key exchange. Slower but solves key distribution problem"},
    {"q":"Digital signature","a":"Hash of data encrypted with sender's private key — proves both integrity (data unchanged) and authenticity (sender verified)"},
    {"q":"Governance in GRC","a":"Rules, policies, and processes that form the foundation. Defines who decides what, accountability structures, and oversight mechanisms"},
    {"q":"Risk management in GRC","a":"Identify threats, assess likelihood/impact, respond (accept/mitigate/transfer/avoid), monitor continuously"},
    {"q":"Compliance in GRC","a":"Adherence to laws and standards (GDPR, HIPAA, ISO 27001, SOC 2, NIST). Compliance != security, but both are essential"}
  ],
  "1-2": [
    {"q":"Authentication","a":"Verifying a user's identity through credentials like passwords or biometrics"},
    {"q":"Authorization","a":"Determining what resources an authenticated user is permitted to access"},
    {"q":"Why is identity the primary security perimeter?","a":"Because cloud/remote work makes the network perimeter insufficient — identity is the main control point"},
    {"q":"Four pillars of identity","a":"Administration, Authentication, Authorization, Auditing"},
    {"q":"Identity Provider (IdP)","a":"Service that creates, manages, and stores digital identities and provides authentication"},
    {"q":"Single Sign-On (SSO)","a":"Authenticate once, access multiple applications without re-entering credentials"},
    {"q":"Active Directory Domain Services (AD DS)","a":"Microsoft's on-premises directory service using Kerberos, NTLM, and LDAP"},
    {"q":"Microsoft Entra ID","a":"Microsoft's cloud-based identity and access management service (formerly Azure AD)"},
    {"q":"Federation","a":"Trust relationship between identity providers enabling cross-organizational access"},
    {"q":"Federation protocols","a":"SAML, OAuth 2.0, OpenID Connect"}
  ],
  "2-1": [
    {"q":"Microsoft Entra","a":"Family of identity and access management products including Entra ID, External ID, Verified ID, and more"},
    {"q":"Microsoft Entra ID","a":"Cloud-based IAM service providing authentication, SSO, and access management"},
    {"q":"Service Principal","a":"Identity used by an application or service to access Azure resources"},
    {"q":"Managed Identity","a":"Automatically managed identity in Entra ID for Azure services — no credential management needed"},
    {"q":"Hybrid identity","a":"Connecting on-premises Active Directory with Entra ID for unified identity"},
    {"q":"Password Hash Sync (PHS)","a":"Syncs a hash of on-premises passwords to Entra ID"},
    {"q":"Pass-through Authentication (PTA)","a":"Entra ID validates passwords against on-prem AD in real-time without storing passwords in cloud"},
    {"q":"Microsoft Entra Connect","a":"Tool that connects on-premises AD with Entra ID for hybrid identity"},
    {"q":"B2B collaboration","a":"External users (guests) access your resources using their own credentials"},
    {"q":"Entra External ID","a":"Platform for building secure customer-facing (B2C) applications"},
    {"q":"Microsoft Entra Agent ID","a":"A first-class identity type in Entra ID built for AI agents, providing dedicated sign-in, Conditional Access, and lifecycle management"},
    {"q":"Why does Entra Agent ID matter","a":"AI agents act autonomously and need their own identity, credentials, and governance — not a shared human account"},
    {"q":"Entra Cloud Sync","a":"Cloud-based sync engine that synchronizes identities from on-premises AD to Entra ID. Microsoft's recommended future direction, simpler deployment than Entra Connect"}
  ],
  "2-2": [
    {"q":"Three passwordless methods in Entra ID","a":"Microsoft Authenticator app, FIDO2 security keys, Windows Hello for Business"},
    {"q":"Three MFA factor categories","a":"Something you know, something you have, something you are"},
    {"q":"Self-Service Password Reset (SSPR)","a":"Users reset their own passwords without IT support after verifying identity"},
    {"q":"Microsoft Authenticator app","a":"Mobile app providing push notifications, OTP codes, and passwordless sign-in"},
    {"q":"FIDO2 security key","a":"Hardware device providing strong, phishing-resistant authentication using public key cryptography"},
    {"q":"Global banned password list","a":"Microsoft-maintained list of commonly used passwords automatically blocked in Entra ID"},
    {"q":"Custom banned password list","a":"Organization-defined list of banned passwords (e.g., company name, products)"},
    {"q":"Windows Hello for Business","a":"Passwordless auth using biometrics or PIN tied to the device's TPM"},
    {"q":"Certificate-Based Authentication (CBA)","a":"X.509 certificates authenticate directly against Entra ID — eliminates need for AD FS. Supports external PKI and smart cards"},
    {"q":"Temporary Access Pass (TAP)","a":"Time-limited passcode issued by admins for onboarding new users or recovering access to register passwordless methods"},
    {"q":"Passwordless authentication","a":"Authentication without passwords using Microsoft Authenticator, FIDO2 passkeys, Windows Hello for Business, or certificate-based auth"},
    {"q":"MFA enforcement methods","a":"Security Defaults (baseline for all users) or Conditional Access policies (granular control with P1/P2 licensing)"},
    {"q":"Password protection on-premises","a":"Global and custom banned password lists can be enforced on on-premises AD DS via password protection proxy"},
    {"q":"Smart lockout","a":"Protects against password-spraying attacks by locking accounts after too many failed sign-in attempts"},
    {"q":"SSPR authentication methods","a":"Users can verify identity using email, phone, security questions, or authenticator app before resetting password"},
    {"q":"FIDO2 passkey types","a":"Device-bound (hardware key, can't be copied) or synced (roams between user's devices via iCloud/Google/Entra)"},
    {"q":"Windows Hello for Business device-bound","a":"Passwordless auth using biometrics or PIN tied to the device's TPM. Device-bound — private key never leaves device"},
    {"q":"Entra ID Account Recovery","a":"Helps users regain access when all authentication methods are lost (e.g., lost/stolen phone). Re-establishes trust via third-party ID verification and issues Temporary Access Pass (TAP) after identity confirmation. Unlike SSPR which requires preregistered methods"},
    {"q":"Verified ID Face Check","a":"High-assurance identity verification powered by Azure AI — matches user's real-time selfie to photo on government-issued ID. Only match result is shared, preserving privacy. Used in account recovery process"},
    {"q":"Authentication methods capability table","a":"Each method supports different combinations of: Primary Auth, MFA (Secondary), SSPR, and Account Recovery"},
    {"q":"Primary-only authentication methods","a":"Password, QR code, Microsoft Authenticator (passwordless mode) — only support primary sign-in, NOT MFA, SSPR, or Account Recovery"},
    {"q":"Primary + MFA methods","a":"Windows Hello for Business, Passkeys (FIDO2, synced, Authenticator), CBA, TAP, Platform Credential for macOS, SMS sign-in — support both sign-in and MFA"},
    {"q":"MFA + SSPR methods","a":"Microsoft Authenticator (push notification), Software OATH tokens, Hardware OATH tokens, Voice call, Email OTP — require a primary auth method first"},
    {"q":"MFA-only methods","a":"External authentication methods (non-Microsoft MFA provider), Authenticator Lite (in-app MFA) — only support secondary/MFA, not primary or SSPR"},
    {"q":"Account Recovery","a":"Only Verified ID (Face Check) supports Account Recovery — NOT sign-in, MFA, or SSPR"}
  ],
  "2-3": [
    {"q":"Conditional Access","a":"Evaluates signals (user, location, device, risk) and enforces access policies like MFA or blocking"},
    {"q":"Three Conditional Access signals","a":"User/group membership, IP location, device state (also: app, sign-in risk, user risk)"},
    {"q":"Conditional Access decisions","a":"Allow, Block, Require MFA, Require compliant device, Require approved client app"},
    {"q":"Global Secure Access","a":"Microsoft's SSE solution for secure access to web, SaaS, and private applications"},
    {"q":"SWG","a":"Secure Web Gateway — filters and secures internet web traffic"},
    {"q":"CASB","a":"Cloud Access Security Broker — visibility and control over SaaS application usage"},
    {"q":"Global Administrator role","a":"Most privileged Entra ID role with access to all administrative features"},
    {"q":"Azure RBAC","a":"Role-Based Access Control for fine-grained access to Azure resources using roles and scopes"},
    {"q":"Authentication Strengths","a":"Conditional Access grant control specifying acceptable MFA method combinations: MFA (any factor), Passwordless MFA, or Phishing-Resistant MFA (FIDO2, CBA, Windows Hello)"},
    {"q":"Require all vs Require one of","a":"When multiple grant controls are selected, 'Require all' means user must satisfy every control (AND). 'Require one of' means satisfying any one is enough (OR)"},
    {"q":"Conditional Access policy components","a":"Assignments (who/what/where/when) and Access Controls (grant/block/session). All assignments are logically ANDed"},
    {"q":"Conditional Access signals","a":"User/group, target resources, network/location, conditions (sign-in risk, user risk, device platform, client app, filters for devices)"},
    {"q":"Conditional Access grant controls","a":"Block, Require MFA, Require compliant device, Require hybrid joined device, Require approved client app, Require app protection policy, Require password change, Require terms of use"},
    {"q":"Conditional Access session controls","a":"App-enforced restrictions (block download, require labeling), sign-in frequency, persistent browser session, Global Secure Access controls"},
    {"q":"Entra ID roles","a":"Control directory-level access: Global Administrator, User Administrator, Security Administrator, Billing Administrator, and service-specific roles"},
    {"q":"Azure RBAC scope","a":"Roles assigned at management group → subscription → resource group → resource. Permissions inherited downward"},
    {"q":"Custom Entra roles","a":"Collections of chosen permissions from preset lists. Assignable at organization-wide or specific object scope. Requires P1 or P2"},
    {"q":"Administrative Units","a":"Container of Entra objects (users, groups, devices) for scoping administrative permissions. Useful for large orgs with regional admins"},
    {"q":"Entra Internet Access","a":"Identity-centric Secure Web Gateway for SaaS and internet traffic. Web content filtering, TLS inspection, tenant restrictions"},
    {"q":"Entra Private Access","a":"Zero Trust Network Access (ZTNA) replacing VPN. Per-app access to private corporate resources — not the entire network"},
    {"q":"Global Secure Access client","a":"Lightweight client on user devices routes traffic through Entra edge. Replaces traditional VPN with identity-centric security"}
  ],
  "2-4": [
    {"q":"Entra ID Governance","a":"Ensures right people have right access to right resources at the right time"},
    {"q":"Access reviews","a":"Periodic reviews where managers/owners confirm or revoke user access"},
    {"q":"Entitlement management","a":"Manages access packages bundling resources and roles for specific groups"},
    {"q":"PIM (Privileged Identity Management)","a":"Just-in-time, time-bound access to privileged roles with approval and audit"},
    {"q":"Benefit of just-in-time access","a":"Reduces attack surface by granting elevated access only when needed"},
    {"q":"User risk (ID Protection)","a":"Probability that a user's identity has been compromised"},
    {"q":"Sign-in risk (ID Protection)","a":"Probability that a specific authentication request is not from the legitimate user"},
    {"q":"Two risk detections","a":"Impossible travel, Anonymous IP (also: leaked credentials, malware-linked IP)"},
    {"q":"Entra Verified ID","a":"Decentralized identity using verifiable credentials for privacy-preserving verification"},
    {"q":"Access package","a":"Bundle of all resources and roles that a specific group of users needs"},
    {"q":"Security Copilot for identity","a":"Natural language queries for identity data, access reviews, and risk analysis to help admins investigate faster"},
    {"q":"Lifecycle workflows","a":"Automate Joiner/Mover/Leaver tasks with triggers (new hire, last day, group membership change), tasks (send email, assign group, update attribute), and schedule conditions"}
  ],
  "3-0": [
    {"q":"Microsoft Security Copilot","a":"AI-powered security assistant using GPT-4 that helps analysts investigate incidents, generate reports, and respond to threats faster"},
    {"q":"Promptbook","a":"A collection of reusable prompts organized for specific security workflows"},
    {"q":"Session in Security Copilot","a":"A conversation context where prompts and responses are maintained together"},
    {"q":"Plugins in Security Copilot","a":"Connectors that allow Copilot to query data sources like Sentinel, Defender, and Intune"},
    {"q":"Security Compute Units (SCUs)","a":"The capacity units required to run Security Copilot — organizations purchase and allocate SCUs"},
    {"q":"Two tips for effective Copilot prompts","a":"Be specific, provide context, ask for structured output, specify data sources"},
    {"q":"Standalone vs Embedded Copilot","a":"Standalone = dedicated Copilot portal for cross-product investigations. Embedded = Copilot integrated directly inside Sentinel, Defender, Entra, Purview, and Intune"},
    {"q":"Orchestrator in Security Copilot","a":"Copilot's core system that composes capabilities together — builds context, creates a plan, executes capabilities, and evaluates results to answer a user's prompt"},
    {"q":"Agent in Security Copilot","a":"Autonomous assistant for repetitive security tasks — Phishing Triage Agent, Threat Intelligence Briefing Agent, Identity Risk Management Agent. Works within defined guardrails"},
    {"q":"Workspace in Security Copilot","a":"Isolated Copilot environment within a tenant, each with its own SCU capacity, data residency, plugin settings, and user permissions"}
  ],
  "3-1": [
    {"q":"DDoS Infrastructure Protection vs DDoS Protection","a":"Infrastructure Protection is free/always-on; Protection plan adds enhanced telemetry, metrics, alerts, and cost protection"},
    {"q":"DDoS attack types","a":"Volumetric, protocol, and application-layer attacks"},
    {"q":"Azure Firewall","a":"Managed cloud-based stateful firewall with FQDN filtering, TLS inspection, IDPS, and threat intelligence"},
    {"q":"Azure Firewall Standard vs Premium","a":"Premium adds TLS inspection for encrypted traffic and enhanced IDPS"},
    {"q":"WAF protects against","a":"Common web exploits: SQL injection, XSS, OWASP Top 10 threats"},
    {"q":"WAF deployment targets","a":"Azure Application Gateway, Azure Front Door, Azure CDN"},
    {"q":"NSG (Network Security Group)","a":"Filters network traffic based on source/dest IP, port, and protocol rules"},
    {"q":"ASGs (Application Security Groups)","a":"Group VMs by application role for network security policies instead of IP addresses"},
    {"q":"Azure Bastion","a":"Managed service for secure browser-based RDP/SSH to VMs without public IP exposure"},
    {"q":"Azure Key Vault","a":"Cloud service for securely storing secrets, encryption keys, and certificates"},
    {"q":"HSM","a":"Hardware Security Module — provides extra security for cryptographic keys"},
    {"q":"Network segmentation","a":"Dividing a network into subnets to isolate resources and limit breach blast radius"},
    {"q":"Virtual Network Manager Security Admin Rules","a":"Centrally managed rules processed before NSGs. Support Always Allow (bypasses NSG for critical traffic) and Deny (kills traffic before reaching NSG)"}
  ],
  "3-2": [
    {"q":"Microsoft Defender for Cloud","a":"Unified security management providing CSPM, CWPP, and DevOps security across multi-cloud"},
    {"q":"CSPM","a":"Cloud Security Posture Management — continuous assessment of security posture"},
    {"q":"Secure score","a":"Numerical value representing current security posture based on implemented recommendations"},
    {"q":"Azure Policy","a":"Service for creating and managing policies to enforce organizational standards and compliance"},
    {"q":"Three industry benchmarks in Defender for Cloud","a":"CIS, NIST, PCI-DSS (also ISO 27001, SOC 2)"},
    {"q":"CWPP","a":"Cloud Workload Protection — enhanced Defender plans for servers, containers, databases, etc."},
    {"q":"Adaptive application control","a":"Recommends which applications should be allowed on VMs based on actual usage"},
    {"q":"Multi-cloud support","a":"Yes, Defender for Cloud supports Azure, AWS, and GCP"},
    {"q":"DevSecOps in Defender for Cloud","a":"Integrates security into CI/CD pipelines via Defender for DevOps — code scanning, secrets detection, and IaC analysis across GitHub, Azure DevOps, and GitLab"},
    {"q":"Attack Path Analysis","a":"AI-powered feature modeling how attackers could chain multiple vulnerabilities/misconfigurations to reach high-value resources. Visualized as attack paths in Defender portal"},
    {"q":"Microsoft Cloud Security Benchmark (MCSB)","a":"Default security initiative in Defender for Cloud — defines policy rules grouped into security controls. Maps to CIS, NIST, PCI DSS, ISO 27001"},
    {"q":"Foundational CSPM","a":"Free tier for all Azure subscriptions — Secure Score, MCSB compliance assessment, security recommendations. No agent required"},
    {"q":"Defender CSPM plan","a":"Advanced posture management — adds attack path analysis, cloud security explorer, advanced threat hunting, deeper compliance assessments"},
    {"q":"Defender for Servers","a":"Threat detection for Windows/Linux VMs. P2 includes EDR integration, OS-level threat detection, file integrity monitoring"},
    {"q":"Defender for Containers","a":"Run-time protection for AKS, vulnerability assessment, Kubernetes hardening"},
    {"q":"Defender for Storage","a":"Threat detection for Blob, ADLS, Files — detects anomalous access, malware uploads"},
    {"q":"Defender for SQL","a":"Vulnerability assessment, threat detection, data classification for Azure SQL / SQL Server"},
    {"q":"Defender for DevOps","a":"Integrates security into CI/CD pipelines — code scanning, secrets detection, IaC analysis. Supports GitHub, Azure DevOps, GitLab"},
    {"q":"Defender for App Service","a":"Identifies attacks targeting applications running over Azure App Service — monitors traffic to underlying infrastructure"},
    {"q":"Defender for Key Vault","a":"Advanced threat protection for Azure Key Vault — detects unusual access patterns and extraction attempts to protect secrets"},
    {"q":"Defender for Resource Manager","a":"Monitors Azure resource management operations (ARM) — detects suspicious activities like unauthorized changes and privilege escalation at the management plane"},
    {"q":"Defender for DNS","a":"Detects suspicious DNS queries and communication with known malicious domains from Azure resources — identifies C2 communication and data exfiltration via DNS tunneling"},
    {"q":"Defender for open-source relational databases","a":"Threat protection for PostgreSQL, MySQL, and MariaDB databases (single/flexible servers)"},
    {"q":"Defender for Azure Cosmos DB","a":"Detects SQL injection attempts, anomalous access patterns, and potential data exfiltration from Cosmos DB accounts"},
    {"q":"Defender for AI Services","a":"CWPP plan for AI workloads — real-time detection of prompt injection, data leakage, data poisoning, and credential theft. Integrates with Microsoft Defender XDR"},
    {"q":"AI Security Posture Management (AI SPM)","a":"Maintains AI Bill of Materials, assesses posture of generative AI workloads, surfaces AI-specific recommendations, and uses attack path analysis. Available in Defender CSPM plan"},
    {"q":"Cloud Security Explorer","a":"Query-based security tool in Defender CSPM plan — lets security teams proactively explore cloud security state using graph-based queries across resources"},
    {"q":"Data Security Posture Management (DSPM)","a":"Discovers sensitive data across multicloud environments (Azure, AWS, GCP), assesses exposure risk, and recommends remediation. Available with Defender CSPM plan or Defender for Storage"},
    {"q":"Regulatory compliance in Defender for Cloud","a":"Add standard-specific assessments (ISO 27001, SOC 2, NIST, PCI DSS, HIPAA). One recommendation can improve compliance across multiple standards"},
    {"q":"Defender for Cloud multicloud","a":"Supports Azure, AWS, and GCP in a single dashboard. Connect via connectors or Azure Arc for on-premises servers"}
  ],
  "3-3": [
    {"q":"SIEM","a":"Security Information and Event Management — collects, correlates, and analyzes security data"},
    {"q":"SOAR","a":"Security Orchestration, Automation, and Response — automates incident response with playbooks"},
    {"q":"Microsoft Sentinel","a":"Cloud-native SIEM and SOAR solution for threat detection and response"},
    {"q":"Data connectors","a":"Pre-built integrations collecting security data from Microsoft, third-party, and custom sources"},
    {"q":"Analytics rules","a":"Detection rules analyzing collected data to identify threats and generate incidents"},
    {"q":"Playbooks","a":"Automated workflows (Azure Logic Apps) executing response actions when incidents trigger"},
    {"q":"Workbooks","a":"Interactive dashboards for visualizing and analyzing security data in Sentinel"},
    {"q":"AI in Sentinel","a":"Correlates events across sources, reduces false positives, identifies complex threats"},
    {"q":"Security Copilot in Sentinel","a":"Provides natural language incident summarization, guided response, and KQL generation from plain English"},
    {"q":"MITRE ATT&CK","a":"Public knowledge base of attacker tactics and techniques. Sentinel maps all analytics rules and detections to this framework for organized threat understanding"},
    {"q":"Sentinel data connectors","a":"350+ built-in connectors for Microsoft and third-party sources. ASIM (Advanced Security Information Model) normalizes data into common schema"},
    {"q":"Sentinel analytics rule types","a":"Scheduled query rules, ML Behavioral Analytics, Fusion correlation engine, threat intelligence matching"},
    {"q":"Sentinel incidents","a":"Related alerts automatically grouped into case files with graph, timeline, and entity pages for investigation"},
    {"q":"Sentinel hunting queries","a":"KQL queries to proactively search for suspicious activity before it triggers a rule"},
    {"q":"Sentinel workbooks","a":"Interactive dashboards for visualizing and analyzing security data"},
    {"q":"Sentinel automation rules","a":"Triggered when incidents/alerts created/updated — execute playbooks (Azure Logic Apps) for automated remediation"},
    {"q":"Sentinel Content Hub","a":"Packaged solutions bundling connectors, workbooks, analytics rules, hunting queries, and playbooks"},
    {"q":"Sentinel Data Lake","a":"Cost-effective long-term storage in open format (Parquet/JSON) preserving security data for up to 12 years"},
    {"q":"Sentinel notebooks","a":"Advanced data science investigations using Python/Jupyter for complex threat analysis"},
    {"q":"Sentinel pricing","a":"Pay-per-GB ingested. Free ingestion for Azure Activity Logs, O365 Audit Logs, and security alerts from Defender products"}
  ],
  "3-4": [
    {"q":"XDR","a":"Extended Detection and Response"},
    {"q":"Microsoft Defender XDR","a":"Unified platform integrating signals from identity, endpoint, email, and cloud apps for comprehensive threat protection"},
    {"q":"Defender for Office 365 protects","a":"Email and collaboration against phishing, spam, malware, and malicious links/attachments"},
    {"q":"Safe Attachments","a":"Opens email attachments in a sandbox to check for malware before delivery"},
    {"q":"Safe Links","a":"Scans URLs in emails and documents at time-of-click to protect against malicious links"},
    {"q":"Defender for Endpoint","a":"Enterprise endpoint security with threat prevention, detection, investigation, and response"},
    {"q":"Defender for Cloud Apps","a":"CASB that discovers shadow IT, monitors cloud app usage, and enforces data policies"},
    {"q":"Defender for Identity","a":"Uses on-premises AD signals to detect identity-based attacks and lateral movement"},
    {"q":"Defender Vulnerability Management","a":"Discovers, prioritizes, and helps remediate vulnerabilities across endpoints"},
    {"q":"Defender Threat Intelligence","a":"Platform providing threat intelligence about adversary infrastructure, tools, and TTPs"},
    {"q":"Microsoft Defender portal","a":"Centralized portal for managing incidents, alerts, hunting, and response across all Defender XDR"},
    {"q":"Shadow IT","a":"Use of cloud applications without IT department knowledge or approval"},
    {"q":"Copilot in Defender XDR","a":"Summarizes incidents, suggests responses, enables natural language threat hunting, and generates reports"}
  ],
  "4-1": [
    {"q":"Service Trust Portal","a":"Portal providing compliance reports, audit reports, certifications, and trust documentation for Microsoft cloud services"},
    {"q":"Documents on Service Trust Portal","a":"SOC audit reports, ISO certifications, PCI reports, white papers, regional compliance info"},
    {"q":"Three Microsoft privacy principles","a":"User control, Transparency, Security (also: Defending data, Compliance with law)"},
    {"q":"Microsoft Priva","a":"Privacy management solution for subject rights requests, risk assessments, and data minimization"},
    {"q":"Subject rights request","a":"Individual's request to access, correct, or delete their personal data (required by GDPR)"},
    {"q":"Data minimization","a":"Collecting and retaining only personal data necessary for a specific purpose"},
    {"q":"Consent Management in Priva","a":"Centralized tracking and management of consumer consent across services"},
    {"q":"Tracker Scanning in Priva","a":"Finds web tracking technologies on your sites"},
    {"q":"Service Trust Portal URL","a":"servicetrust.microsoft.com — Microsoft's public site for audit reports, compliance documentation, certifications, and whitepapers"},
    {"q":"STP content categories","a":"Certifications/Regulations/Standards, Reports/Whitepapers/Artifacts, Industry/Regional Resources, Resources for your Organization"},
    {"q":"STP My Library","a":"Save and track relevant STP documents with email notifications when documents are updated"},
    {"q":"Microsoft privacy principle: Control","a":"Your data belongs to you — you can access, modify, delete, or export it at any time. Microsoft uses your data only to provide the services you agreed to"},
    {"q":"Microsoft privacy principle: Transparency","a":"Microsoft documents data collection, processing, and storage practices clearly. Privacy statements and data protection addendums are publicly available"},
    {"q":"Microsoft privacy principle: Security","a":"Advanced encryption at rest (AES-256) and in transit (TLS, IPsec) with multiple independent encryption layers"},
    {"q":"Microsoft privacy principle: Legal protections","a":"Microsoft directs government data requests to customers, challenges legally invalid demands, and notifies customers when legally permitted"},
    {"q":"Microsoft privacy principle: No content-based targeting","a":"Microsoft does not use customer data for advertising. No scanning of email, docs, or content for ad targeting"},
    {"q":"Microsoft privacy principle: Benefit to customer","a":"Customer data is used only to improve service reliability and security, never for competitive advantage"},
    {"q":"Priva Privacy Risk Management","a":"Identify overexposed data, risky transfers, over-retention across M365, Azure, and third-party environments"},
    {"q":"Priva Subject Rights Requests","a":"Automated access/deletion workflows with data discovery across M365, Azure, and third parties for GDPR compliance"},
    {"q":"Priva Privacy Assessments","a":"Auto-evaluate data processing activities for privacy risk"},
    {"q":"ISO/IEC 27018","a":"International code of practice for cloud privacy — Microsoft complies to reinforce data control commitments"}
  ],
  "4-2": [
    {"q":"Sensitive Information Types (SITs)","a":"Predefined or custom patterns identifying sensitive data like credit cards, SSNs, passport numbers"},
    {"q":"Trainable classifier","a":"AI-based tool identifying sensitive content by analyzing examples rather than predefined patterns"},
    {"q":"Content Explorer","a":"Shows where sensitive data is located across the organization and what labels are applied"},
    {"q":"Activity Explorer","a":"Shows activities on labeled content: label changes, sharing, access events"},
    {"q":"Sensitivity labels","a":"Classify and protect documents, emails, and containers with markings, encryption, and access restrictions"},
    {"q":"DLP (Data Loss Prevention)","a":"Policies detecting and preventing inappropriate sharing of sensitive data"},
    {"q":"DLP enforcement locations","a":"Exchange, SharePoint, OneDrive, Teams, Power BI, Defender for Cloud Apps"},
    {"q":"Insider Risk Management","a":"Detects risky activities by internal users: data theft, IP leaks, security policy violations"},
    {"q":"Adaptive protection","a":"Automatically adjusts user access level based on risk severity from Insider Risk Management"},
    {"q":"DSPM for AI","a":"Unified visibility into data security risks, especially how AI services interact with sensitive content"},
    {"q":"Data Security Investigations","a":"Investigate data security incidents by tracking suspicious access, sharing, and movement across Microsoft 365"},
    {"q":"EDM classifiers (Exact Data Match)","a":"Match against exact records from a database (e.g., employee IDs, customer lists). Uses a salted hash of the sensitive data for privacy — Microsoft never sees the raw values"}
  ],
  "4-3": [
    {"q":"Microsoft Purview portal","a":"Centralized compliance portal integrating compliance management, data governance, and data security"},
    {"q":"Compliance Manager","a":"Tool guiding organizations through regulatory requirements with assessments, improvement actions, and compliance score"},
    {"q":"Compliance score","a":"Numerical percentage representing compliance posture based on completed improvement actions"},
    {"q":"Communication Compliance","a":"Detects code of conduct violations and policy issues in email, Teams, and Viva Engage using ML classifiers"},
    {"q":"eDiscovery","a":"Identifying, collecting, and reviewing electronically stored information for legal cases or investigations"},
    {"q":"eDiscovery Standard vs Premium","a":"Premium adds custodian management, review sets, analytics, and hold policies"},
    {"q":"Standard audit log retention","a":"180 days (was 90 days before Oct 2023; Premium audit retains 1 year+)"},
    {"q":"Audit solutions","a":"Recording and searching user/admin activities across Microsoft 365 for investigations and compliance"},
    {"q":"Data Lifecycle Management","a":"Manages content retention and deletion using retention policies and labels"},
    {"q":"Records management","a":"Declares documents as records with retention schedules and disposition reviews"},
    {"q":"Retention policies vs labels","a":"Policies apply to containers (sites, mailboxes); labels apply to individual items"},
    {"q":"Disposition review","a":"Reviewers decide whether to permanently delete or retain content at end of retention period"}
  ],
  "4-4": [
    {"q":"Data governance","a":"Policies, roles, and processes for ensuring data quality, security, compliance, and usability across the organization"},
    {"q":"Microsoft Purview Data Map","a":"Scans and catalogs data sources, discovers data assets, classifies them, and maps relationships"},
    {"q":"Unified Catalog","a":"Business-friendly view of data assets enabling discovery, understanding, and trust across the organization"},
    {"q":"Business glossary in Purview","a":"Centralized collection of business terms and definitions to ensure consistent understanding of data"},
    {"q":"Data lineage","a":"Tracking the origin, movement, and transformation of data through its lifecycle"},
    {"q":"Why data governance matters","a":"Ensures data is trustworthy, discoverable, compliant, and can be used effectively for decision-making"},
    {"q":"Federated governance model","a":"Centralized safety and standards with decentralized ownership across business domains — reduces bottlenecks while maintaining consistency"},
    {"q":"Data governance roles","a":"Data consumers (find and use data), data owners (register and manage assets), data stewards (ensure quality and policies), central data office (set governance policies)"},
    {"q":"Purview metadata types","a":"Technical (schema, data types), Business (descriptions, glossary terms), Semantic (classifications, sensitivity labels), Operational (processing activities, transformation history)"},
    {"q":"Governance Domains","a":"Business-concept boundaries (Marketing, Finance, Sales, HR) organizing data products and providing context for underlying data assets"},
    {"q":"Data Products","a":"Business-ready constructs — named, described, owned data assets serving a specific use case (e.g., 'Customer 360 data product' bundling tables, pipelines, reports)"},
    {"q":"Glossary Terms","a":"Business-language definitions for processes and systems (e.g., 'Net Revenue,' 'Active Customer'). Ensure consistent understanding across organization"},
    {"q":"Critical Data Elements (CDEs)","a":"Logical groupings of important information (e.g., 'Customer Email,' 'Product SKU') with quality rules, access policies, and ownership"},
    {"q":"Data Quality in Purview","a":"Evaluate data using no-code rules (null check, range validation, uniqueness) and AI-generated rules. Scores published at asset, product, and domain levels"},
    {"q":"Health Management in Purview","a":"Governance progress tracking via health controls and health actions — provides steps to improve governance scores and data health across domains"},
    {"q":"Why data governance matters for AI","a":"AI systems depend on trusted, high-quality data. Poorly governed data (incomplete, inconsistent, mislabeled) produces unreliable AI results"}
  ],
  "js-1": [
    {"q":"Shared responsibility in IaaS","a":"Customer manages OS, apps, identity, and data; provider handles physical infrastructure and hosts"},
    {"q":"Shared responsibility in PaaS","a":"Customer manages data, devices, and identities; provider handles OS, runtime, and physical layers"},
    {"q":"Shared responsibility in SaaS","a":"Customer manages identities, devices, and identity infrastructure sync; provider handles the rest"},
    {"q":"What the customer always retains","a":"Identities, devices, and data"},
    {"q":"Defense in depth","a":"Layered security strategy across physical, identity, perimeter, network, compute, application, and data layers"},
    {"q":"CIA triad","a":"Confidentiality, Integrity, Availability"},
    {"q":"Dictionary attack","a":"Brute-force attempt using a pre-built table of common password hashes"},
    {"q":"Zero Trust core principles","a":"Verify explicitly, least privilege (JEA/JIT), assume breach"},
    {"q":"Seven pillars of Zero Trust","a":"Identities, Devices, Applications, Data, Infrastructure, Networks, Visibility"},
    {"q":"Symmetric encryption","a":"Uses the same key to encrypt and decrypt; main challenge is securely sharing the key"},
    {"q":"Asymmetric encryption","a":"Uses a public/private key pair; encrypt with recipient's public key, decrypt with their private key"},
    {"q":"Digital signature","a":"Hash of data encrypted with sender's private key to prove integrity and authenticity"},
    {"q":"Hashing purpose for passwords","a":"Store the hash, not the password; salt makes each hash unique against dictionary attacks"},
    {"q":"Azure Key Vault secret","a":"Read/write value such as a password or connection string"},
    {"q":"Azure Key Vault key","a":"Imported or generated key that cannot be exported; cryptographic operations are performed inside the vault"},
    {"q":"Azure Key Vault certificate","a":"Full lifecycle management of TLS/SSL certificates"},
    {"q":"Governance","a":"The rules, practices, and processes that form the foundation of an organization's activities"},
    {"q":"Risk in GRC","a":"Identifying, assessing, and responding to threats (external and internal)"},
    {"q":"Data residency vs data sovereignty","a":"Residency is where data physically lives; sovereignty is which country's laws apply"},
    {"q":"Service principal","a":"Identity for an application or service, authenticated with a secret or certificate"},
    {"q":"Managed identity","a":"Azure-managed identity for Azure resources — system-assigned to one resource or user-assigned to several; no secret to manage"},
    {"q":"Four pillars of identity","a":"Administration, Authentication, Authorization, Audit"},
    {"q":"Modern authentication protocols","a":"OAuth 2.0 (authorization), OpenID Connect (identity on top of OAuth 2.0), SAML (federation)"},
    {"q":"Single Sign-On (SSO)","a":"Authenticate once against the IdP and access all services that trust that IdP"},
    {"q":"Identity federation","a":"Trust relationship between two identity providers so identities in one can access resources in another"},
    {"q":"Active Directory Domain Services","a":"On-premises hierarchical directory using Kerberos and NTLM with organizational units"},
    {"q":"Microsoft Entra ID","a":"Cloud-based identity provider (formerly Azure AD) that speaks modern cloud protocols"},
    {"q":"Entra Connect vs Entra Cloud Sync","a":"Connect runs the sync engine on-premises; Cloud Sync runs the engine in the cloud (the future direction)"},
    {"q":"Password Hash Sync (PHS)","a":"Syncs a hash of the user's password hash from AD DS to Entra ID"},
    {"q":"Entra joined vs registered vs hybrid joined","a":"Joined: device authenticates to Entra (Win10+, corporate). Registered: BYOD. Hybrid: joined to AD DS and synced/registered to Entra"},
    {"q":"Three MFA factor categories","a":"Something you know, something you have, something you are"},
    {"q":"Passkey (FIDO2)","a":"Phishing-resistant, passwordless authentication that requires proximity (e.g., Bluetooth) between devices"},
    {"q":"Security defaults","a":"Entra ID baseline that enforces MFA for all users, admins, and risky actions when Conditional Access is not available"},
    {"q":"Conditional Access","a":"Entra authorization mechanism that evaluates signals (user, location, device, risk) and applies controls before issuing a token"},
    {"q":"RBAC role assignment","a":"A role (set of permissions) assigned to an identity at a specific scope"},
    {"q":"Password protection in Entra","a":"Global banned list (Microsoft weak passwords) + custom banned list (org-specific terms)"},
    {"q":"Joiner/Mover/Leaver lifecycle","a":"Identity governance automation using lifecycle workflows triggered by start and end dates"},
    {"q":"Access reviews","a":"Periodic checks that confirm whether users still need their group, application, or role access"},
    {"q":"Privileged Identity Management (PIM)","a":"Just-in-time role elevation — eligible by default, activated on demand for a defined time window"},
    {"q":"User risk vs sign-in risk","a":"User risk is aggregate identity risk (e.g., dark web password); sign-in risk is per-event risk (e.g., new country/device)"},
    {"q":"Permissions Management","a":"Cross-cloud (Azure, AWS, GCP) discovery of permissions, recommendation to remove unused, and ongoing monitoring"},
    {"q":"Entra Private Access","a":"Zero Trust replacement for VPN — redirects private traffic through Entra edge where Conditional Access is evaluated"},
    {"q":"Entra Internet Access","a":"Secures outbound internet traffic by validating FQDNs and categories before allowing access"},
    {"q":"DDoS Protection Basic","a":"Free, automatic protection against high-volume attacks only — not application-tuned"},
    {"q":"DDoS Protection Standard tiers","a":"Network (protects all public IPs in a vNet) or IP (protects specific IPs)"},
    {"q":"Azure Firewall layers","a":"Layer 4 (network) and Layer 7 (application) — FQDN-aware, TLS inspection, threat intelligence"},
    {"q":"WAF (Web Application Firewall)","a":"Protects against OWASP top exploits using Core Rule Set (CRS) — global (Front Door) or regional (App Gateway)"},
    {"q":"Virtual Network (vNet)","a":"Regional isolation boundary in a subscription — vNets cannot communicate by default; peering enables connectivity"},
    {"q":"Network Security Group (NSG)","a":"Rules based on source/dest IP, port, and protocol — typically assigned to subnets to segment traffic"},
    {"q":"Virtual Network Manager Security Admin Rule","a":"Centrally managed rule processed before NSGs supports Always Allow (bypass NSG) and Deny (block before NSG)"},
    {"q":"Azure Bastion","a":"Managed jump box for RDP/SSH access to VMs without public IPs — eliminates port scanning exposure"},
    {"q":"Defender for Cloud pillars","a":"CSPM (posture), CWPP (workload protection), DevSecOps (shift left)"},
    {"q":"Secure score","a":"Defender for Cloud metric reflecting the security posture of the cloud environment"},
    {"q":"Microsoft Sentinel","a":"Cloud-native SIEM (collect, detect, investigate) and SOAR (automated response) built on a Log Analytics workspace"},
    {"q":"Security Copilot experiences","a":"Embedded (inside product portals) and immersive (standalone prompt across services)"},
    {"q":"Defender XDR components","a":"Office 365, Endpoint, Cloud Apps, Identity, Vulnerability Management, plus threat intelligence"},
    {"q":"Six principles of compliance","a":"Control, Transparency, Security, Legal protections, No content-based targeting, Benefit to customer"},
    {"q":"Service Trust Portal","a":"Resource for compliance documentation, certifications, reports, white papers, and regional/industry information"},
    {"q":"Microsoft Priva","a":"Privacy solution with Privacy Risk Management (find and limit private data) and Subject Rights Requests"},
    {"q":"Microsoft Purview","a":"Unified governance, compliance, and data security solution"},
    {"q":"Compliance Manager","a":"Purview tool that tracks a compliance score, assessments, and improvement actions assigned to individuals"},
    {"q":"Data lifecycle steps in Purview","a":"Know, Classify, Protect, Prevent, Govern"},
    {"q":"Sensitivity label","a":"Classification plus actions (watermark, encryption, access controls) — clear-text metadata, single label per item"},
    {"q":"Records management","a":"Restricts activities on items labeled as records, logs all actions, and provides proof of disposition"},
    {"q":"eDiscovery tiers","a":"Content search (basic) < eDiscovery Standard (cases, legal holds) < eDiscovery Premium (full end-to-end workflow)"},
    {"q":"Audit Standard vs Premium","a":"Standard = 180-day default retention (was 90 days before Oct 2023); Premium = 1-year retention plus higher-bandwidth API"}
  ],
  "gl-1": [
    {"q":"Shared Responsibility pizza analogy","a":"On-prem = homemade, IaaS = pizza base, PaaS = partially prepared, SaaS = delivered. Customer always retains data, devices, identities"},
    {"q":"Seven layers of Defense in Depth","a":"Physical → Identity → Perimeter → Network → Compute → Application → Data"},
    {"q":"CIA Triad","a":"Confidentiality (encryption), Integrity (hashing), Availability (redundancy/backups)"},
    {"q":"Zero Trust principles","a":"Verify explicitly, Use least privilege access, Assume breach"},
    {"q":"Six pillars of Zero Trust","a":"Identities, Devices, Applications, Data, Infrastructure, Networks"},
    {"q":"Symmetric vs Asymmetric encryption","a":"Symmetric uses one shared key; Asymmetric uses a public/private key pair"},
    {"q":"What does hashing + salting provide?","a":"One-way password storage with per-user salt to defeat dictionary attacks"},
    {"q":"GRC","a":"Governance (policies), Risk (identification/mitigation), Compliance (laws/regulations)"},
    {"q":"Four pillars of identity","a":"Administration, Authentication, Authorization, Auditing"},
    {"q":"Authentication vs Authorization","a":"Authentication = proving who you are; Authorization = what you can do once signed in"},
    {"q":"Federation","a":"Trust between identity providers — users authenticate with their own IdP"},
    {"q":"Microsoft Entra ID","a":"Cloud-based IAM service, central identity for cloud + on-premises apps"},
    {"q":"Hybrid identity sync tools","a":"Entra Connect (on-premises sync engine) vs Entra Cloud Sync (runs in cloud)"},
    {"q":"Entra authentication options","a":"Password Hash Sync (recommended), Pass-through Authentication, Federation"},
    {"q":"MFA factors","a":"Something you know (password), something you have (phone/token), something you are (biometric)"},
    {"q":"Passwordless methods","a":"Windows Hello, Microsoft Authenticator, FIDO2 security keys, certificate-based auth"},
    {"q":"Conditional Access logic","a":"If-then engine: signals (user, location, device, risk) → controls (block, MFA, compliant device)"},
    {"q":"Global Secure Access","a":"Entra Internet Access (SaaS/web) + Entra Private Access (replaces VPN). Identity-driven SSE"},
    {"q":"PIM","a":"Just-in-time role elevation, time-bound, requires MFA + approval, fully audited"},
    {"q":"Identity Protection risks","a":"User risk (leaked credentials) + Sign-in risk (atypical travel, anonymous IP)"},
    {"q":"Security Copilot modes","a":"Standalone (dedicated portal) + Embedded (inside Sentinel, Defender, Entra)"},
    {"q":"Security Copilot key terms","a":"Session, Prompt, Plugin, Workspace, Orchestrator, Agent"},
    {"q":"Azure DDoS Protection tiers","a":"Network Protection (all vNet IPs) vs IP Protection (specific IPs). Default infrastructure protection for all"},
    {"q":"Azure Firewall layers","a":"Layer 7 (application rules, FQDNs, TLS inspection) + Layer 4 (network rules, TCP/UDP)"},
    {"q":"WAF deployment options","a":"Azure Front Door (global) or Azure Application Gateway (regional)"},
    {"q":"NSG priority","a":"100-4096. Lower number = higher priority. First match wins. Cannot delete default rules, only override"},
    {"q":"Azure Bastion","a":"Managed jump box — RDP/SSH to VMs without public IPs, directly from portal over TLS"},
    {"q":"Azure Key Vault object types","a":"Secrets (passwords/connection strings), Keys (non-exportable crypto), Certificates (TLS/SSL lifecycle)"},
    {"q":"Defender for Cloud three pillars","a":"CSPM (posture), CWPP (workloads), DevSecOps (shift-left)"},
    {"q":"MCSB","a":"Microsoft Cloud Security Benchmark — default security initiative in Defender for Cloud"},
    {"q":"Sentinel four core functions","a":"Collect (connectors), Detect (analytics rules + MITRE ATT&CK), Investigate (incidents + hunting), Respond (playbooks)"},
    {"q":"SIEM vs SOAR","a":"SIEM = collect, detect, investigate; SOAR = automated response (playbooks)"},
    {"q":"Defender for Office 365 key feature","a":"Zero-hour auto-purge (ZAP) — auto-removes malicious email after delivery"},
    {"q":"Defender for Cloud Apps","a":"Cloud Discovery (37k+ app catalog), SSPM, shadow IT detection, risky OAuth permissions"},
    {"q":"Defender for Identity","a":"Lightweight sensors on AD domain controllers detect privilege escalation and lateral movement"},
    {"q":"Service Trust Portal","a":"servicetrust.microsoft.com — audit reports, certifications, standards, white papers"},
    {"q":"Six Microsoft privacy principles","a":"Control, Transparency, Security, Strong legal protections, No content-based targeting, Benefit to customer"},
    {"q":"Microsoft Priva capabilities","a":"Privacy Risk Management, Subject Rights Requests, Consent Management, Tracker Scanning, Privacy Assessments"},
    {"q":"Sensitivity labels","a":"Persistent clear-text metadata — can encrypt, watermark, or classify. Travel with content. Auto-applied"},
    {"q":"DLP","a":"Data Loss Prevention — real-time detection across M365 + endpoints. Policy tips → block with/without override"},
    {"q":"Insider Risk Management workflow","a":"Policies → risk indicators → alerts → triage → cases → remediation"},
    {"q":"Adaptive Protection","a":"ML assesses user risk level → auto-adjusts DLP, retention, and CA controls"},
    {"q":"Audit Standard vs Premium","a":"Standard = 180-day (was 90 days before Oct 2023); Premium = 1-year + custom retention + higher bandwidth API"},
    {"q":"eDiscovery tiers","a":"Content Search (basic) < Standard (cases + holds) < Premium (analytics + custodian management)"},
    {"q":"Compliance Manager","a":"Prebuilt assessments (ISO, GDPR), improvement actions with points, shared responsibility score"},
    {"q":"Retention labels vs policies","a":"Labels = item-level, travel with content; Policies = broad-level (entire mailbox/site)"},
    {"q":"Regulatory Records","a":"Strongest protection — label cannot be removed, retention cannot be shortened (even by admins)"},
    {"q":"Purview Data Catalog","a":"Organizes data into business domains, data products, glossary. Federated governance model"}
  ]
};

let flashcardData = {};
let flashcardDataLoaded = false;

// Load flashcard data from JSON file, fall back to inline data for file:// protocol
async function loadFlashcardData() {
  try {
    const response = await fetch('data/flashcards.json');
    if (response.ok) {
      flashcardData = await response.json();
      flashcardDataLoaded = true;
      return;
    }
  } catch (e) {
    // file:// protocol blocks fetch — expected
  }
  // Fallback to inline data
  flashcardData = FLASHCARD_INLINE;
  flashcardDataLoaded = true;
}

// State
let currentSection = '1-1';
let flashcardStates = {};

// Initialize flashcard states
function initFlashcardState(sectionId) {
  if (!flashcardStates[sectionId]) {
    const cards = flashcardData[sectionId] || [];
    const stored = JSON.parse(localStorage.getItem('sc900-fc-' + sectionId) || '{}');
    flashcardStates[sectionId] = {
      cards: cards,
      order: cards.map((_, i) => i),
      currentIndex: 0,
      flipped: false,
      status: stored.status || {}
    };
  }
}

// Render flashcards
function renderFlashcards(sectionId) {
  initFlashcardState(sectionId);
  const state = flashcardStates[sectionId];
  const container = document.getElementById('fc-' + sectionId);
  if (!container || !state.cards.length) return;

  const card = state.cards[state.order[state.currentIndex]];
  const total = state.cards.length;
  const current = state.currentIndex + 1;
  const cardId = state.order[state.currentIndex];
  const status = state.status[cardId] || '';

  container.innerHTML = `
    <div class="flashcard-counter">${current} / ${total}</div>
    <div class="flashcard-wrapper" onclick="flipCard('${sectionId}')">
      <div class="flashcard ${state.flipped ? 'flipped' : ''}">
        <div class="flashcard-face flashcard-front">
          <span class="card-label">Question</span>
          <div class="flashcard-text">${card.q}</div>
        </div>
        <div class="flashcard-face flashcard-back">
          <span class="card-label">Answer</span>
          <div class="flashcard-text">${card.a}</div>
        </div>
      </div>
    </div>
    <div class="flashcard-controls">
      <button class="fc-btn" onclick="prevCard('${sectionId}')">&#8592; Prev</button>
      <button class="fc-btn" onclick="shuffleCards('${sectionId}')">&#128256; Shuffle</button>
      <button class="fc-btn" onclick="nextCard('${sectionId}')">Next &#8594;</button>
    </div>
    <div class="flashcard-status">
      <button class="fc-btn known ${status === 'known' ? 'known' : ''}" onclick="markCard('${sectionId}','known')">&#10003; Known</button>
      <button class="fc-btn review ${status === 'review' ? 'review' : ''}" onclick="markCard('${sectionId}','review')">&#8634; Review</button>
    </div>
    <div class="flashcard-progress">
      ${state.order.map((id, i) => {
        const s = state.status[id] || '';
        const cls = s + (i === state.currentIndex ? ' current' : '');
        return `<div class="progress-dot ${cls}"></div>`;
      }).join('')}
    </div>
    <div class="keyboard-hint">
      <kbd>&#8592;</kbd> <kbd>&#8594;</kbd> navigate &nbsp; <kbd>Space</kbd> flip
    </div>
  `;
}

function flipCard(sectionId) {
  flashcardStates[sectionId].flipped = !flashcardStates[sectionId].flipped;
  renderFlashcards(sectionId);
}

function nextCard(sectionId) {
  const state = flashcardStates[sectionId];
  state.currentIndex = (state.currentIndex + 1) % state.cards.length;
  state.flipped = false;
  renderFlashcards(sectionId);
}

function prevCard(sectionId) {
  const state = flashcardStates[sectionId];
  state.currentIndex = (state.currentIndex - 1 + state.cards.length) % state.cards.length;
  state.flipped = false;
  renderFlashcards(sectionId);
}

function shuffleCards(sectionId) {
  const state = flashcardStates[sectionId];
  for (let i = state.order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [state.order[i], state.order[j]] = [state.order[j], state.order[i]];
  }
  state.currentIndex = 0;
  state.flipped = false;
  renderFlashcards(sectionId);
}

function markCard(sectionId, mark) {
  const state = flashcardStates[sectionId];
  const cardId = state.order[state.currentIndex];
  if (state.status[cardId] === mark) {
    delete state.status[cardId];
  } else {
    state.status[cardId] = mark;
  }
  localStorage.setItem('sc900-fc-' + sectionId, JSON.stringify({status: state.status}));
  renderFlashcards(sectionId);
}

// Navigation
function showSection(sectionId, { scrollToTop = true } = {}) {
  currentSection = sectionId;
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('section-' + sectionId).classList.add('active');
  document.querySelectorAll('.section-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`.section-link[data-section="${sectionId}"]`).classList.add('active');

  // Open parent domain group (read from section's data-domain attribute)
  const sectionEl = document.getElementById('section-' + sectionId);
  const domain = sectionEl ? sectionEl.dataset.domain : sectionId.split('-')[0];
  document.querySelectorAll('.domain-group').forEach(g => {
    if (g.dataset.domain === domain) g.classList.add('open');
  });

  // Render flashcards for this section
  renderFlashcards(sectionId);

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('active');

  // Scroll to top (skip when navigating from search)
  if (scrollToTop) {
    window.scrollTo({top: 0, behavior: 'smooth'});
  }
}

function toggleDomain(header) {
  header.parentElement.classList.toggle('open');
}

function switchTab(btn, tabName) {
  const section = btn.closest('.section');
  const sectionId = section.id.replace('section-', '');
  section.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  section.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  section.querySelector(`.tab-content[data-tab="${tabName}"]`).classList.add('active');

  if (tabName === 'flashcards') {
    renderFlashcards(sectionId);
  }
}

// Theme
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('sc900-theme', next);
  document.getElementById('themeToggle').innerHTML = next === 'dark' ? '&#9728;' : '&#9790;';
}

// Sidebar toggle
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('active');
}

document.getElementById('sidebarOverlay').addEventListener('click', () => {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('active');
});

// ─── Search ──────────────────────────────────────────────────────────────

let searchTimeout = null;
let searchSelectedIndex = -1;

function getSectionTitle(sectionId) {
  const map = {
    '1-1': '1.1 Security & Compliance Concepts',
    '1-2': '1.2 Identity Concepts',
    '2-1': '2.1 Function & Identity Types',
    '2-2': '2.2 Authentication Capabilities',
    '2-3': '2.3 Access Management',
    '2-4': '2.4 Identity Protection & Governance',
    '3-0': '3.0 Microsoft Security Copilot',
    '3-1': '3.1 Core Infrastructure Security',
    '3-2': '3.2 Security Management',
    '3-3': '3.3 Microsoft Sentinel',
    '3-4': '3.4 Threat Protection with Defender XDR',
    '4-1': '4.1 Service Trust Portal & Privacy',
    '4-2': '4.2 Data Security',
    '4-3': '4.3 Data Compliance',
    '4-4': '4.4 Data Governance',
    'js-1': 'John Savill SC-900 Study Cram',
    'gl-1': 'Georgia Kalyva SC-900 Video',
    'kp-1': 'SC-900 Key Pointers',
    'lic-1': 'SC-900 Licensing Guide'
  };
  return map[sectionId] || 'Section ' + sectionId;
}

function removeHighlights() {
  document.querySelectorAll('mark.search-match').forEach(m => {
    const parent = m.parentNode;
    parent.replaceChild(document.createTextNode(m.textContent), m);
    parent.normalize();
  });
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function handleSearch(query) {
  const resultsEl = document.getElementById('searchResults');
  const trimmed = query.trim();

  // Remove old highlights
  removeHighlights();
  searchSelectedIndex = -1;

  if (trimmed.length < 2) {
    resultsEl.classList.remove('active');
    resultsEl.innerHTML = '';
    return;
  }

  const regex = new RegExp('(' + escapeRegex(trimmed) + ')', 'gi');

  // Gather all sections
  const sectionEls = document.querySelectorAll('.section');

  // Build results: array of { sectionId, snippet, textNode }
  const results = [];

  sectionEls.forEach(section => {
    const sectionId = section.id.replace('section-', '');
    const isActive = section.classList.contains('active');

    const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (node.parentElement.closest('.flashcard-container, .flashcard')) return NodeFilter.FILTER_REJECT;
        if (node.parentElement.tagName === 'SCRIPT' || node.parentElement.tagName === 'STYLE') return NodeFilter.FILTER_REJECT;
        if (node.parentElement.tagName === 'MARK') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent;
      if (regex.test(text)) {
        // Create a snippet around the match
        const matchIndex = text.toLowerCase().indexOf(trimmed.toLowerCase());
        const snippetStart = Math.max(0, matchIndex - 40);
        const snippetEnd = Math.min(text.length, matchIndex + trimmed.length + 60);
        let snippet = (snippetStart > 0 ? '…' : '') +
          text.substring(snippetStart, snippetEnd).trim() +
          (snippetEnd < text.length ? '…' : '');

        results.push({ sectionId, snippet, isActive });
      }
    }
  });

  // Deduplicate: keep max 3 snippets per section, prefer active section first
  const seen = {};
  const deduped = [];
  results.forEach(r => {
    if (!seen[r.sectionId]) seen[r.sectionId] = 0;
    if (seen[r.sectionId] < 3) {
      seen[r.sectionId]++;
      deduped.push(r);
    }
  });

  // Clamp at 50 total
  const finalResults = deduped.slice(0, 50);

  // Render dropdown
  if (finalResults.length === 0) {
    resultsEl.innerHTML = '<div class="result-empty">No results found for "<strong>' + escapeRegex(trimmed) + '</strong>"</div>';
    resultsEl.classList.add('active');
    return;
  }

  let html = '<div class="result-count">' + finalResults.length + ' result' + (finalResults.length > 1 ? 's' : '') + ' for "<strong>' + escapeRegex(trimmed) + '</strong>"</div>';
  let idx = 0;
  let lastSection = '';
  finalResults.forEach(r => {
    const title = getSectionTitle(r.sectionId);
    html += '<button type="button" class="result-item" data-section="' + r.sectionId + '" data-idx="' + idx + '" onclick="navigateToSearchResult(\'' + r.sectionId + '\',\'' + escapeRegex(trimmed) + '\')">';
    html += '<div class="result-section">' + title + '</div>';
    html += '<div class="result-snippet">' + r.snippet.replace(regex, '<mark>$1</mark>') + '</div>';
    html += '</button>';
    idx++;
    lastSection = r.sectionId;
  });

  resultsEl.innerHTML = html;
  resultsEl.classList.add('active');
  searchSelectedIndex = -1;
}

function navigateToSearchResult(sectionId, query) {
  // Close dropdown
  document.getElementById('searchResults').classList.remove('active');

  // Navigate to section (skip scroll-to-top, we'll scroll to match instead)
  showSection(sectionId, { scrollToTop: false });

  // Small delay for DOM to render the section, then highlight
  setTimeout(() => {
    removeHighlights();
    const section = document.getElementById('section-' + sectionId);
    if (!section || query.length < 2) return;

    const regex = new RegExp('(' + escapeRegex(query) + ')', 'gi');
    const textNodes = [];
    const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (node.parentElement.closest('.flashcard-container, .flashcard')) return NodeFilter.FILTER_REJECT;
        if (node.parentElement.tagName === 'SCRIPT' || node.parentElement.tagName === 'STYLE') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    let node;
    while ((node = walker.nextNode())) {
      if (regex.test(node.textContent)) textNodes.push(node);
    }

    textNodes.forEach(textNode => {
      const span = document.createElement('span');
      span.innerHTML = textNode.textContent.replace(regex, '<mark class="search-match">$1</mark>');
      textNode.parentNode.replaceChild(span, textNode);
    });

    // Scroll to first match
    const firstMatch = section.querySelector('mark.search-match');
    if (firstMatch) {
      firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 150);
}

// Search keyboard navigation
document.addEventListener('keydown', (e) => {
  const searchInput = document.getElementById('searchInput');
  const resultsEl = document.getElementById('searchResults');
  const items = resultsEl.querySelectorAll('.result-item');

  // If search is focused and results are showing
  if (document.activeElement === searchInput && resultsEl.classList.contains('active') && items.length > 0) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items.forEach(i => i.classList.remove('selected'));
      searchSelectedIndex = Math.min(searchSelectedIndex + 1, items.length - 1);
      items[searchSelectedIndex].classList.add('selected');
      items[searchSelectedIndex].scrollIntoView({ block: 'nearest' });
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      items.forEach(i => i.classList.remove('selected'));
      searchSelectedIndex = Math.max(searchSelectedIndex - 1, 0);
      items[searchSelectedIndex].classList.add('selected');
      items[searchSelectedIndex].scrollIntoView({ block: 'nearest' });
      return;
    }
    if (e.key === 'Enter' && searchSelectedIndex >= 0) {
      e.preventDefault();
      items[searchSelectedIndex].click();
      searchInput.blur();
      return;
    }
    if (e.key === 'Escape') {
      resultsEl.classList.remove('active');
      searchInput.blur();
      return;
    }
  }

  // Close search results on Escape even without focus
  if (e.key === 'Escape' && resultsEl.classList.contains('active')) {
    resultsEl.classList.remove('active');
    searchInput.blur();
    return;
  }

  // Flashcards keyboard nav (only when flashcards tab is active)
  const activeSection = document.getElementById('section-' + currentSection);
  if (!activeSection) return;
  const flashcardTab = activeSection.querySelector('.tab-content[data-tab="flashcards"].active');
  if (!flashcardTab) return;

  if (e.key === 'ArrowRight') { e.preventDefault(); nextCard(currentSection); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); prevCard(currentSection); }
  if (e.key === ' ') { e.preventDefault(); flipCard(currentSection); }
});

// Close search results on click outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-container')) {
    document.getElementById('searchResults').classList.remove('active');
  }
});

// Init
(async function init() {
  // Load flashcard data first
  await loadFlashcardData();

  // Load theme
  const savedTheme = localStorage.getItem('sc900-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.getElementById('themeToggle').innerHTML = savedTheme === 'dark' ? '&#9728;' : '&#9790;';

  // Attach domain toggle click handlers with debounce (browser_click fires 2x)
  let domainToggleGuard = false;
  document.querySelectorAll('.domain-header').forEach(el => {
    el.addEventListener('click', function(e) {
      if (domainToggleGuard) return;
      domainToggleGuard = true;
      setTimeout(() => { domainToggleGuard = false; }, 200);
      const domain = this.getAttribute('data-domain');
      const group = document.querySelector('.domain-group[data-domain="' + domain + '"]');
      if (group) {
        group.classList.toggle('open');
      }
    });
  });

  // Back to top
  const btn = document.getElementById('back-to-top');
  if (btn) {
    const getScrollY = () => window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    const onScroll = () => { btn.classList.toggle('visible', getScrollY() > 400); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Render initial flashcards
  renderFlashcards('1-1');
})();
