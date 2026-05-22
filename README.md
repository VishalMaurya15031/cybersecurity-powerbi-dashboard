# 🔐 Cybersecurity Threat Intelligence Dashboard (Power BI)

## 📌 Project Overview
This project is my first end-to-end Data Analytics project built using Power BI.

The goal of this project is to analyze cybersecurity attack data and understand attacker behavior using an interactive dashboard that simulates a Security Operations Center (SOC) environment.

Instead of manually reading thousands of security logs, the dashboard converts complex technical data into clear visual insights that help monitoring and investigation.

## 📊 Dashboard Preview  (https://cybersecurity-powerbi-dashboard.vercel.app/)
### Overview Page
### Technical Analysis Page
### Investigation Page

 

---

## 🎯 Project Objectives
• Understand real-world cybersecurity datasets  
• Perform data preparation and structuring  
• Build a relational data model (Fact & Dimension tables)  
• Design monitoring and investigation dashboards  
• Explain cyber attack patterns visually  

---

## 🧩 Project Workflow

Raw Security Logs  
→ Data Cleaning & Structuring  
→ Data Modeling  
→ Visualization  
→ Threat Monitoring  
→ Investigation & Insights

---

## 🧹 Data Preparation (Pre-Processing Logic)

Before loading data into Power BI, the dataset was cleaned and structured.

Key steps performed:

• Removed missing and invalid values  
• Converted timestamp into date-time format  
• Categorized risk levels (Low / Medium / High)  
• Generated attack count metrics  
• Structured data into relational tables  
• Prepared dataset for analytical model

### Example Transformation Logic

```python
import pandas as pd

df = pd.read_csv("attacks.csv")

# Convert timestamp
df["timestamp"] = pd.to_datetime(df["timestamp"])

# Risk category classification
def risk(score):
    if score < 4:
        return "Low"
    elif score < 7:
        return "Medium"
    else:
        return "High"

df["risk_category"] = df["threat_score"].apply(risk)

# Aggregate attacks
attack_summary = df.groupby(["country","technique"]).size().reset_index(name="attack_count")

df.to_csv("clean_attacks.csv", index=False)
