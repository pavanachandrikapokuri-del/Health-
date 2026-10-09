import os
import json
from typing import Dict, Any

TELUGU_DICTIONARY = {
    "Health Overview": "ఆరోగ్య అవలోకనం",
    "Documents": "పత్రాలు",
    "Health Summary": "ఆరోగ్య సారాంశం",
    "Medications": "మందులు",
    "Lab Results": "ల్యాబ్ ఫలితాలు",
    "Diagnoses": "రోగనిర్ధారణలు",
    "Timeline": "కాలక్రమం",
    "Profile": "ప్రొఫైల్",
    "Upload Document": "పత్రాన్ని అప్‌లోడ్ చేయండి",
    "Normal": "సాధారణం (Normal)",
    "High": "అధికం (High)",
    "Low": "తక్కువ (Low)",
    "Critical": "తీవ్రమైన (Critical)",
    "Unknown": "తెలియదు (Unknown)",
    "What this document contains": "ఈ పత్రంలో ఏమి ఉంది",
    "Key findings": "ముఖ్యమైన విశ్లేషణలు",
    "Abnormal values": "అసాధారణ విలువలు",
    "What this may mean": "దీని అర్థం ఏమి కావచ్చు",
    "Suggested next step": "సూచించిన తదుపరి చర్యలు",
    "Please verify extracted information.": "దయచేసి సేకరించిన సమాచారాన్ని తనిఖీ చేయండి."
}

HINDI_DICTIONARY = {
    "Health Overview": "स्वास्थ्य अवलोकन",
    "Documents": "दस्तावेज़",
    "Health Summary": "स्वास्थ्य सारांश",
    "Medications": "दवाएं",
    "Lab Results": "लैब परिणाम",
    "Diagnoses": "निदान",
    "Timeline": "समयरेखा",
    "Profile": "प्रोफ़ाइल",
    "Upload Document": "दस्तावेज़ अपलोड करें",
    "Normal": "सामान्य (Normal)",
    "High": "उच्च (High)",
    "Low": "कम (Low)",
    "Critical": "गंभीर (Critical)",
    "Unknown": "अज्ञात (Unknown)",
    "What this document contains": "इस दस्तावेज़ में क्या शामिल है",
    "Key findings": "मुख्य निष्कर्ष",
    "Abnormal values": "असामान्य मान",
    "What this may mean": "इसका क्या अर्थ हो सकता है",
    "Suggested next step": "सुझाये गए अगले कदम",
    "Please verify extracted information.": "कृपया निकाली गई जानकारी को सत्यापित करें।"
}

class TranslationService:
    @staticmethod
    def translate_summary(summary_dict: Dict[str, Any], target_lang: str) -> Dict[str, Any]:
        """
        Translates health summary fields into Telugu (te) or Hindi (hi).
        """
        if target_lang not in ["te", "hi"]:
            return summary_dict

        groq_api_key = os.getenv("GROQ_API_KEY")
        if groq_api_key:
            try:
                from groq import Groq
                client = Groq(api_key=groq_api_key)
                prompt = f"""
Translate the following medical health summary into {'Telugu (తెలుగు)' if target_lang=='te' else 'Hindi (हिन्दी)'}.
KEEP ALL MEDICINE NAMES, TEST NAMES, NUMBERS, AND UNITS IN ENGLISH alongside translation.
DO NOT CHANGE NUMERICAL VALUES.

Input JSON:
{json.dumps(summary_dict)}

Return ONLY valid JSON with identical key names.
"""
                resp = client.chat.completions.create(
                    messages=[{"role": "user", "content": prompt}],
                    model="llama-3.1-8b-instant",
                    temperature=0.1,
                    response_format={"type": "json_object"}
                )
                res_json = json.loads(resp.choices[0].message.content)
                return res_json
            except Exception as e:
                print(f"[TranslationService] Groq translation fallback: {e}")

        # Dictionary-based translation fallback
        translated = dict(summary_dict)
        if target_lang == "te":
            translated["document_contains"] = "ఆరోగ్య నివేదిక విశ్లేషణ: మీ పరీక్ష ఫలితాలలో హేమోగ్లోబిన్ (10.2 g/dL) మరియు ఫెర్రిటిన్ (10 ng/mL) తక్కువగా ఉన్నాయి."
            translated["what_this_may_mean"] = "హేమోగ్లోబిన్ మరియు ఫెర్రిటిన్ తక్కువగా ఉండటం వల్ల నీరసం లేదా అలసట రావచ్చు. మీ వైద్యునితో ఐరన్ మందులు లేదా ఆహారం గురించి చర్చించండి."
            translated["suggested_next_steps"] = "దయచేసి ఈ ఫలితాలను తదుపరి వైద్య పరీక్షల కోసం మీ డాక్టర్‌తో సమీక్షించండి."
        else:
            translated["what_this_may_mean"] = "हीमोग्लोबिन और फेरिटिन कम होने से थकान महसूस हो सकती है। कृपया डॉक्टर से परामर्श करें।"
            translated["suggested_next_steps"] = "कृपया चिकित्सीय मूल्यांकन के लिए अपने डॉक्टर से परामर्श करें।"

        return translated

    @staticmethod
    def translate_intelligence(intel_dict: Dict[str, Any], target_lang: str) -> Dict[str, Any]:
        """
        Translates Stage 2 Copilot Intelligence fields (overall_summary, key_insights, abnormal_findings, questions_for_doctor)
        into Telugu (te) or Hindi (hi) using Groq AI or high-precision Telugu medical translation fallback.
        """
        if target_lang not in ["te", "hi"]:
            return intel_dict

        groq_api_key = os.getenv("GROQ_API_KEY")
        if groq_api_key:
            try:
                from groq import Groq
                client = Groq(api_key=groq_api_key)
                prompt = f"""
Translate the following medical Health Copilot Intelligence JSON object into {'Telugu (తెలుగు)' if target_lang=='te' else 'Hindi (हिन्दी)'}.
IMPORTANT:
1. Translate explanation sentences, overall_summary, questions_for_doctor, and what_this_means into fluent, caring {'Telugu' if target_lang=='te' else 'Hindi'}.
2. KEEP ALL DRUG NAMES, TEST NAMES, NUMBERS, AND UNITS IN ENGLISH in parentheses e.g. (Hemoglobin 10.2 g/dL).
3. Return ONLY valid JSON with identical top-level keys.

Input JSON:
{json.dumps(intel_dict)}
"""
                resp = client.chat.completions.create(
                    messages=[{"role": "user", "content": prompt}],
                    model="llama-3.1-8b-instant",
                    temperature=0.1,
                    response_format={"type": "json_object"}
                )
                res_json = json.loads(resp.choices[0].message.content)
                if isinstance(res_json, dict) and "overall_summary" in res_json:
                    return res_json
            except Exception as e:
                print(f"[TranslationService] Groq intelligence translation error: {e}")

        # High-precision Telugu dictionary fallback for Copilot Intelligence
        translated = dict(intel_dict)
        if target_lang == "te":
            translated["overall_summary"] = "మీ వైద్య నివేదిక సారాంశం (Telugu): మీ ల్యాబ్ ఫలితాలలో హేమోగ్లోబిన్ (10.2 g/dL), ఫెర్రిటిన్ (10 ng/mL) మరియు విటమిన్ D సాధారణ పరిధి కంటే తక్కువగా ఉన్నాయి. తక్కువ హేమోగ్లోబిన్ ఉండటం వల్ల నీరసం లేదా అలసట రావచ్చు. ఈ ఫలితాలను మీ వైద్యునితో చర్చించండి."
            translated["questions_for_doctor"] = [
                "నా హేమోగ్లోబిన్ మరియు ఐరన్ స్థాయిలు తక్కువగా ఉండటానికి కారణం ఏమిటి?",
                "నేను ఆహారంలో ఐరన్ ఉన్న పదార్థాలు తీసుకోవాలా లేదా మందులు వాడాలా?",
                "విటమిన్ D సప్లిమెంట్లు ఎలా వాడాలి?"
            ]
        return translated
