'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'kn';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    kn: string;
  };
}

const dict: Translations = {

  // Navigation
  nav_home: { en: 'Home', hi: 'होम', kn: 'ಮುಖಪುಟ' },
  nav_about: { en: 'About Us', hi: 'हमारे बारे में', kn: 'ನಮ್ಮ ಬಗ್ಗೆ' },
  nav_future: { en: 'Future', hi: 'भविष्य', kn: 'ಭವಿಷ್ಯ' },
  nav_market: { en: 'Marketplace', hi: 'मार्केटप्लेस', kn: 'ಮಾರುಕಟ್ಟೆ' },
  nav_dash: { en: 'Dashboard', hi: 'डैशबोर्ड', kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' },
  nav_wishlist: { en: 'Wishlist', hi: 'विशलिस्ट', kn: 'ಇಷ್ಟ-ಪಟ್ಟಿ' },
  nav_cart: { en: 'Cart', hi: 'कार्ट', kn: 'ಕಾರ್ಟ್' },
  nav_list: { en: 'Explore Map', hi: 'एक्सप्लोर मैप', kn: 'ನಕ್ಷೆಯನ್ನು ಅನ್ವೇಷಿಸಿ' },

  // Impact Stats
  imp_badge: { en: 'The Impact', hi: 'प्रभाव', kn: 'ಪರಿಣಾಮ' },
  imp_title1: { en: 'Real Impact,', hi: 'वास्तविक प्रभाव,', kn: 'ನೈಜ ಪರಿಣಾಮ,' },
  imp_title2: { en: 'Real Numbers', hi: 'वास्तविक आंकड़े', kn: 'ನೈಜ ಸಂಖ್ಯೆಗಳು' },
  imp_desc: { en: "Our community's collective impact, updated in real time.", hi: 'हमारे समुदाय का सामूहिक प्रभाव, वास्तविक समय में अद्यतन।', kn: 'ನಮ್ಮ ಸಮುದಾಯದ ಸಾಮೂಹಿಕ ಪ್ರಭಾವ, ನೈಜ ಸಮಯದಲ್ಲಿ ನವೀಕರಿಸಲಾಗಿದೆ.' },
  imp_stat1: { en: 'CO₂ Saved', hi: 'CO₂ बचाया', kn: 'CO₂ ಉಳಿಸಲಾಗಿದೆ' },
  imp_stat2: { en: 'Transactions', hi: 'लेनदेन', kn: 'ವಹಿವಾಟುಗಳು' },
  imp_stat3: { en: 'Active Users', hi: 'सक्रिय उपयोगकर्ता', kn: 'ಸಕ್ರಿಯ ಬಳಕೆದಾರರು' },
  imp_stat4: { en: 'Items Listed', hi: 'सूचीबद्ध वस्तुएं', kn: 'ಪಟ್ಟಿ ಮಾಡಲಾದ ವಸ್ತುಗಳು' },

  // Membership Preview
  mem_prev_badge: { en: 'Elite Rewards', hi: 'एलीट पुरस्कार', kn: 'ಶ್ರೇಷ್ಠ ಬಹುಮಾನಗಳು' },
  mem_prev_title1: { en: 'Your Impact.', hi: 'आपका प्रभाव।', kn: 'ನಿಮ್ಮ ಪ್ರಭಾವ.' },
  mem_prev_title2: { en: 'Your Status.', hi: 'आपकी स्थिति।', kn: 'ನಿಮ್ಮ ಸ್ಥಾನ.' },
  mem_prev_desc: { en: 'Every eco-friendly action builds your Activity Score. Higher scores unlock exclusive tiers, permanent discounts, and special platform privileges.', hi: 'हर पर्यावरण के अनुकूल कार्य आपके एक्टिविटी स्कोर को बढ़ाता है। उच्च स्कोर विशेष स्तर, स्थायी छूट और विशेष प्लेटफ़ॉर्म विशेषाधिकारों को अनलॉक करते हैं।', kn: 'ಪ್ರತಿ ಪರಿಸರ ಸ್ನೇಹಿ ಕ್ರಿಯೆ ನಿಮ್ಮ ಚಟುವಟಿಕೆ ಸ್ಕೋರ್ ಅನ್ನು ನಿರ್ಮಿಸುತ್ತದೆ. ಹೆಚ್ಚಿನ ಸ್ಕೋರ್‌ಗಳು ವಿಶೇಷ ಸ್ತರಗಳು, ಶಾಶ್ವತ ರಿಯಾಯಿತಿಗಳು ಮತ್ತು ವಿಶೇಷ ವೇದಿಕೆಯ ಸೌಲಭ್ಯಗಳನ್ನು ಅನ್ಲಾಕ್ ಮಾಡುತ್ತವೆ.' },
  mem_most_pop: { en: 'Most Elite', hi: 'सबसे विशिष्ट', kn: 'ಅತ್ಯಂತ ಗಣ್ಯ' },
  mem_join: { en: 'Join', hi: 'शामिल हों', kn: 'ಸೇರಿ' },

  // Live Scanner
  live_scan_title: { en: 'Live Scan Validation', hi: 'लाइव स्कैन सत्यापन', kn: 'ನೇರ ಸ್ಕ್ಯಾನ್ ಮೌಲ್ಯೀಕರಣ' },
  live_scan_cancel: { en: 'X Cancel', hi: 'X रद्द करें', kn: 'X ರದ್ದುಗೊಳಿಸಿ' },
  live_scan_fetching: { en: 'Fetching Product...', hi: 'उत्पाद प्राप्त कर रहा है...', kn: 'ಉತ್ಪನ್ನವನ್ನು ಪಡೆಯುತ್ತಿದೆ...' },
  live_scan_fail: { en: 'Failed to find QR code in image.', hi: 'छवि में QR कोड खोजने में विफल।', kn: 'ಚಿತ್ರದಲ್ಲಿ QR ಕೋಡ್ ಹುಡುಕಲು ವಿಫಲವಾಗಿದೆ.' },
  live_scan_cam_err: { en: 'Camera blocked or not found. Please allow camera permissions.', hi: 'कैमरा ब्लॉक है या नहीं मिला। कृपया कैमरे की अनुमति दें।', kn: 'ಕ್ಯಾಮೆರಾ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ ಅಥವಾ ಸಿಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಅನುಮತಿಗಳನ್ನು ನೀಡಿ.' },
  live_scan_btn: { en: 'View in Marketplace', hi: 'मार्केटप्लेस में देखें', kn: 'ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ವೀಕ್ಷಿಸಿ' },
  live_scan_prompt: { en: 'Point camera at Product QR Code', hi: 'उत्पाद QR कोड पर कैमरा इंगित करें', kn: 'ಉತ್ಪನ್ನ QR ಕೋಡ್‌ಗೆ ಕ್ಯಾಮೆರಾ ಪಾಯಿಂಟ್ ಮಾಡಿ' },
  live_scan_upload: { en: 'Upload Image Instead', hi: 'इसके बजाय छवि अपलोड करें', kn: 'ಬದಲಾಗಿ ಚಿತ್ರವನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ' },
  live_scan_match: { en: 'Match Verified!', hi: 'मिलान सत्यापित!', kn: 'ಹೊಂದಾಣಿಕೆ ದೃಢೀಕರಿಸಲಾಗಿದೆ!' },
  live_scan_validating: { en: 'Validating product signatures...', hi: 'उत्पाद हस्ताक्षर मान्य कर रहा है...', kn: 'ಉತ್ಪನ್ನದ ಸಹಿಗಳನ್ನು ಮೌಲ್ಯೀಕರಿಸಲಾಗುತ್ತಿದೆ...' },

  // Marketplace
  mkt_title: { en: 'Marketplace', hi: 'मार्केटप्लेस', kn: 'ಮಾರುಕಟ್ಟೆ' },
  mkt_desc: { en: 'Browse {count} listings across swap, rent, food rescue, and upcycling.', hi: 'अदला-बदली, किराए, भोजन बचाव और अपसाइकिलिंग में {count} सूची ब्राउज़ करें।', kn: 'ವಿನಿಮಯ, ಬಾಡಿಗೆ, ಆಹಾರ ರಕ್ಷಣೆ ಮತ್ತು ಅಪ್‌ಸೈಕ್ಲಿಂಗ್‌ಗಳಲ್ಲಿ {count} ಪಟ್ಟಿಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ.' },
  mkt_search: { en: 'Search items...', hi: 'वस्तुएं खोजें...', kn: 'ವಸ್ತುಗಳನ್ನು ಹುಡುಕಿ...' },
  mkt_empty: { en: 'No listings found', hi: 'कोई सूची नहीं मिली', kn: 'ಯಾವುದೇ ಪಟ್ಟಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ' },
  mkt_empty_desc: { en: 'Try adjusting your search or filters.', hi: 'अपनी खोज या फ़िल्टर समायोजित करने का प्रयास करें।', kn: 'ನಿಮ್ಮ ಹುಡುಕಾಟ ಅಥವಾ ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಸರಿಹೊಂದಿಸಲು ಪ್ರಯತ್ನಿಸಿ.' },
  mkt_clear: { en: 'Clear Filters', hi: 'फ़िल्टर साफ़ करें', kn: 'ಫಿಲ್ಟರ್‌ಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ' },
  mkt_showing: { en: 'Showing {filtered} of {total} listings', hi: '{total} में से {filtered} सूची दिखा रहा है', kn: '{total} ರಲ್ಲಿ {filtered} ಪಟ್ಟಿಗಳನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ' },

  // Problem Statement
  prob_reality_badge: { en: 'The Reality', hi: 'सच्चाई', kn: 'ವಾಸ್ತವ' },
  prob_reality_title1: { en: '2.12 billion tons', hi: '२.१२ अरब टन', kn: '೨.೧೨ ಬಿಲಿಯನ್ ಟನ್' },
  prob_reality_title2: { en: 'of waste end up in landfills every year.', hi: 'कचरा हर साल लैंडफिल में जाता है।', kn: 'ತ್ಯಾಜ್ಯ ಪ್ರತಿ ವರ್ಷ ಲ್ಯಾಂಡ್‌ಫಿಲ್‌ಗಳಲ್ಲಿ ಸೇರುತ್ತದೆ.' },
  prob_reality_desc: { en: 'While perfectly good items go unused, edible food rots, and valuable materials are buried. The linear economy is completely broken.', hi: 'जबकि पूरी तरह से अच्छी चीजें बेकार जाती हैं, खाने योग्य भोजन सड़ जाता है, और मूल्यवान सामग्री दफन हो जाती है। रेखीय अर्थव्यवस्था पूरी तरह से टूट चुकी है।', kn: 'ಸರಿಯಾಗಿರುವ ವಸ್ತುಗಳು ಉಪಯೋಗವಾಗದೆ ಉಳಿದರೆ, ತಿನ್ನಬಹುದಾದ ಆಹಾರ ಕೊಳೆಯುತ್ತದೆ, ಮತ್ತು ಬೆಲೆಬಾಳುವ ಸಾಮಗ್ರಿಗಳು ಹೂಳಲ್ಪಡುತ್ತವೆ. ರೇಖೀಯ ಆರ್ಥಿಕತೆ ಸಂಪೂರ್ಣವಾಗಿ ಮುರಿದುಬಿದ್ದಿದೆ.' },
  prob_stat1_title: { en: '40%', hi: '४०%', kn: '೪೦%' },
  prob_stat1_desc: { en: 'of food is wasted', hi: 'भोजन बर्बाद होता है', kn: 'ಆಹಾರ ವ್ಯರ್ಥವಾಗುತ್ತದೆ' },
  prob_stat2_title: { en: '92M', hi: '९२ मिलियन', kn: '೯೨ ದಶಲಕ್ಷ' },
  prob_stat2_desc: { en: 'tons of textile waste', hi: 'टन कपड़ा कचरा', kn: 'ಟನ್ ಜವಳಿ ತ್ಯಾಜ್ಯ' },
  prob_stat3_title: { en: '50M', hi: '५० मिलियन', kn: '೫೦ ದಶಲಕ್ಷ' },
  prob_stat3_desc: { en: 'tons of e-waste', hi: 'टन ई-कचरा', kn: 'ಟನ್ ಇ-ತ್ಯಾಜ್ಯ' },
  prob_sol_badge: { en: 'The Solution', hi: 'समाधान', kn: 'ಪರಿಹಾರ' },
  prob_sol_title1: { en: 'Enter the', hi: 'दर्ज करें', kn: 'ಪ್ರವೇಶಿಸಿ' },
  prob_sol_title2: { en: 'Circular Economy', hi: 'सर्कुलर अर्थव्यवस्था', kn: 'ಸರ್ಕ್ಯುಲರ್ ಆರ್ಥಿಕತೆ' },
  prob_sol_desc: { en: 'We are flipping the system. By actively rewarding reuse, responsible reselling, and sustainable choices, we turn waste back into wealth.', hi: 'हम सिस्टम को पलट रहे हैं। पुन: उपयोग, जिम्मेदार पुनर्विक्रय और टिकाऊ विकल्पों को सक्रिय रूप से पुरस्कृत करके, हम कचरे को वापस धन में बदलते हैं।', kn: 'ನಾವು ವ್ಯವಸ್ಥೆಯನ್ನು ತಿರುಗಿಸುತ್ತಿದ್ದೇವೆ. ಮರುಬಳಕೆ, ಜವಾಬ್ದಾರಿಯುತ ಮರುಮಾರಾಟ ಮತ್ತು ಸುಸ್ಥಿರ ಆಯ್ಕೆಗಳಿಗೆ ಸಕ್ರಿಯವಾಗಿ ಬಹುಮಾನ ನೀಡುವ ಮೂಲಕ ತ್ಯಾಜ್ಯವನ್ನು ಸಂಪತ್ತಾಗಿ ಪರಿವರ್ತಿಸುತ್ತೇವೆ.' },
  prob_ben1_title: { en: 'Zero Waste', hi: 'शून्य कचरा', kn: 'ಶೂನ್ಯ ತ್ಯಾಜ್ಯ' },
  prob_ben1_desc: { en: 'Keep materials in loop', hi: 'सामग्री को लूप में रखें', kn: 'ಸಾಮಗ್ರಿಗಳನ್ನು ಮುಂದುವರಿಸಿದಿರಿ' },
  prob_ben2_title: { en: 'Carbon Negative', hi: 'कार्बन नेगेटिव', kn: 'ಕಾರ್ಬನ್ ನೆಗೆಟಿವ್' },
  prob_ben2_desc: { en: 'Offset emissions directly', hi: 'उत्सर्जन को सीधे ऑफसेट करें', kn: 'ನೇರ ಹೊರಸೂಸುವಿಕೆಗಳನ್ನು ಆಫ್ಸೆಟ್ ಮಾಡಿ' },
  prob_ben3_title: { en: 'Economic Gain', hi: 'आर्थिक लाभ', kn: 'ಆರ್ಥಿಕ ಲಾಭ' },
  prob_ben3_desc: { en: 'Profit from sustainability', hi: 'स्थिरता से लाभ कमाएं', kn: 'ಸುಸ್ಥಿರತೆಯ ಲಾಭ' },

  // How It Works
  hiw_badge: { en: 'How It Works', hi: 'यह कैसे काम करता है', kn: 'ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ' },
  hiw_title1: { en: 'Three Steps to', hi: 'तीन कदम', kn: 'ಮೂರು ಹೆಜ್ಜೆಗಳು' },
  hiw_title2: { en: 'Zero Waste', hi: 'शून्य कचरा', kn: 'ಶೂನ್ಯ ತ್ಯಾಜ್ಯ' },
  hiw_step1_title: { en: 'List or Discover', hi: 'सूची बनाएं या खोजें', kn: 'ಪಟ್ಟಿ ಅಥವಾ ಅನ್ವೇಷಿಸಿ' },
  hiw_step1_desc: { en: 'Post items to swap, rent, or find surplus food and upcycling materials near you.', hi: 'चीजें अदला-बदली, किराए या सरप्लस भोजन और अपसाइकिलिंग सामग्री खोजने के लिए पोस्ट करें।', kn: 'ವಿನಿಮಯ, ಬಾಡಿಗೆ ಗಳಿಗೆ ವಸ್ತುಗಳನ್ನು ಪೋಸ್ಟ್ ಮಾಡಿ, ಅಥವಾ ನಿಮ್ಮ ಹತ್ತಿರ ಹೆಚ್ಚುವರಿ ಆಹಾರ ಮತ್ತು ಅಪ್‌ಸೈಕ್ಲಿಂಗ್ ವಸ್ತುಗಳನ್ನು ಹುಡುಕಿ.' },
  hiw_step2_title: { en: 'Connect & Exchange', hi: 'जुड़ें और विनिमय करें', kn: 'ಸಂಪರ್ಕ ಮತ್ತು ವಿನಿಮಯ' },
  hiw_step2_desc: { en: 'Match with neighbors, shelters, and creators. Every exchange diverts waste from landfills.', hi: 'पड़ोसियों, आश्रयों और रचनाकारों के साथ मिलें। प्रत्येक विनिमय लैंडफिल से कचरे को कम करता है।', kn: 'ನೆರೆಹೊರೆಯವರೊಂದಿಗೆ, ಆಶ್ರಯ, ಮತ್ತು ರಚನೆಕಾರರೊಂದಿಗೆ ಹೊಂದಿಸಿ. ಪ್ರತಿಯೊಂದು ವಿನಿಮಯವು ಲ್ಯಾಂಡ್‌ಫಿಲ್‌ಗಳಿಂದ ತ್ಯಾಜ್ಯವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.' },
  hiw_step3_title: { en: 'Track Your Impact', hi: 'अपना प्रभाव ट्रैक करें', kn: 'ನಿಮ್ಮ ಪರಿಣಾಮವನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ' },
  hiw_step3_desc: { en: 'See your CO₂ savings, earn badges, climb the leaderboard, and unlock local rewards.', hi: 'अपनी CO₂ बचत देखें, बैज कमाएं, लीडरबोर्ड पर चढ़ें, और स्थानीय पुरस्कारों को अनलॉक करें।', kn: 'ನಿಮ್ಮ CO₂ ಉಳಿತಾಯವನ್ನು ನೋಡಿ, ಬ್ಯಾಡ್ಜ್‌ಗಳನ್ನು ಗಳಿಸಿ, ಲೀಡರ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ಏರಿರಿ ಮತ್ತು ಸ್ಥಳೀಯ ಪ್ರತಿಫಲಗಳನ್ನು ಅನ್ಲಾಕ್ ಮಾಡಿ.' },

  // Hero Section
  hero_badge: { en: 'Next-Gen Circular Platform', hi: 'अगली पीढ़ी का सर्कुलर प्लेटफॉर्म', kn: 'ಮುಂದಿನ ಪೀಳಿಗೆಯ ಸರ್ಕ್ಯುಲರ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್' },
  hero_title1: { en: 'Track. Trade.', hi: 'ट्रैक। व्यापार।', kn: 'ಟ್ರ್ಯಾಕ್. ವ್ಯಾಪಾರ.' },
  hero_title2: { en: 'Transform', hi: 'बदलें', kn: 'ಪರಿವರ್ತನೆ' },
  hero_title3: { en: 'Sustainability.', hi: 'स्थिरता।', kn: 'ಸುಸ್ಥಿರತೆ.' },
  hero_desc: { en: 'A premium marketplace where every action counts. Scan products, upcycle goods, and earn elite membership rewards through high-impact eco-habits.', hi: 'एक प्रीमियम बाज़ार जहाँ हर कार्रवाई मायने रखती है। उत्पादों को स्कैन करें, अपसाइकिल करें, और हाई-इम्पैक्ट इको-हैबिट्स के माध्यम से एलीट मेम्बरशिप रिवॉर्ड कमाएँ।', kn: 'ಪ್ರತಿ ಕ್ರಿಯೆಯೂ ಮುಖ್ಯವಾದ ಪ್ರೀಮಿಯಂ ಮಾರುಕಟ್ಟೆ. ಉತ್ಪನ್ನಗಳನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ, ಅಪ್‌ಸೈಕಲ್ ಮಾಡಿ ಮತ್ತು ಹೆಚ್ಚಿನ ಪರಿಣಾಮ ಬೀರುವ ಪರಿಸರ-ಆಚರಣೆಗಳ ಮೂಲಕ ಗಣ್ಯ ಸದಸ್ಯತ್ವ ಪ್ರತಿಫಲಗಳನ್ನು ಗಳಿಸಿ.' },
  btn_get_started: { en: 'Get Started', hi: 'शुरू करें', kn: 'ಪ್ರಾರಂಭಿಸಿ' },
  btn_scan: { en: 'Scan Product', hi: 'उत्पाद स्कैन करें', kn: 'ಉತ್ಪನ್ನವನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ' },

  // Feature Modules
  feat_badge: { en: 'Core Features', hi: 'मुख्य विशेषताएं', kn: 'ಮುಖ್ಯ ಲಕ್ಷಣಗಳು' },
  feat_title1: { en: 'Powered by', hi: 'संचालित', kn: 'ಶಕ್ತಿಯಿಂದ' },
  feat_title2: { en: 'Innovation', hi: 'नवाचार', kn: 'ನಾವೀನ್ಯತೆ' },
  feat_desc: { en: 'Stop buying disposable. Start investing in a circular lifecycle that rewards you the greener you get.', hi: 'डिस्पोजेबल खरीदना बंद करें। एक सर्कुलर जीवनचक्र में निवेश करना शुरू करें जो आपको हरा-भरा होने पर पुरस्कृत करता है।', kn: 'ಬಿಸಾಡಬಹುದಾದ ವಸ್ತುಗಳನ್ನು ಖರೀದಿಸುವುದನ್ನು ನಿಲ್ಲಿಸಿ. ಹಸಿರುಮಯವಾದಂತೆ ನಿಮಗೆ ಪ್ರತಿಫಲ ನೀಡುವ ವೃತ್ತಾಕಾರದ ಜೀವನಚಕ್ರದಲ್ಲಿ ಹೂಡಿಕೆ ಮಾಡಲು ಪ್ರಾರಂಭಿಸಿ.' },
  feat_1_title: { en: 'Digital Product Passport', hi: 'डिजिटल उत्पाद पासपोर्ट', kn: 'ಡಿಜಿಟಲ್ ಉತ್ಪನ್ನ ಪಾಸ್ಪೋರ್ಟ್' },
  feat_1_desc: { en: 'Every item on the platform is assigned a verifiable eco-score and lifecycle history. Know the true impact of what you own and trade.', hi: 'प्लेटफॉर्म पर प्रत्येक आइटम को एक सत्यापित इको-स्कोर और जीवनचक्र इतिहास सौंपा गया है। आप जो भी व्यापार करते हैं उसके वास्तविक प्रभाव को जानें।', kn: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ನಲ್ಲಿನ ಪ್ರತಿಯೊಂದು ಐಟಂಗೆ ಪರಿಶೀಲಿಸಬಹುದಾದ ಇಕೋ-ಸ್ಕೋರ್ ಮತ್ತು ಜೀವನಚಕ್ರದ ಇತಿಹಾಸವನ್ನು ನಿಗದಿಪಡಿಸಲಾಗಿದೆ. ನೀವು ಹೊಂದುವ ಮತ್ತು ವ್ಯಾಪಾರ ಮಾಡುವ ನಿಜವಾದ ಪ್ರಭಾವವನ್ನು ತಿಳಿಯಿರಿ.' },
  feat_1_tag: { en: 'TRANSPARENCY', hi: 'पारदर्शिता', kn: 'ಪಾರದರ್ಶಕತೆ' },
  feat_1_stats: { en: 'Immutable Tracking', hi: 'अचल ट्रैकिंग', kn: 'ಬದಲಾಯಿಸಲಾಗದ ಟ್ರ್ಯಾಕಿಂಗ್' },
  feat_2_title: { en: 'Buy & Sell Marketplace', hi: 'खरीदें और बेचें बाज़ार', kn: 'ಮಾರುಕಟ್ಟೆಯನ್ನು ಖರೀದಿಸಿ ಮತ್ತು ಮಾರಿ' },
  feat_2_desc: { en: 'A robust ecosystem to trade, swap, and rescue items. Every successful transaction is tied directly to real-world carbon offset estimates.', hi: 'वस्तुओं का व्यापार, अदला-बदली और बचाव करने के लिए एक मजबूत पारिस्थितिकी तंत्र। प्रत्येक सफल लेनदेन सीधे वास्तविक दुनिया के कार्बन ऑफसेट अनुमानों से जुड़ा होता है।', kn: 'ವಸ್ತುಗಳನ್ನು ವ್ಯಾಪಾರ ಮಾಡಲು, ವಿನಿಮಯ ಮಾಡಲು ಮತ್ತು ರಕ್ಷಿಸಲು ಒಂದು ದೃಢವಾದ ಪರಿಸರ ವ್ಯವಸ್ಥೆ. ಪ್ರತಿಯೊಂದು ಯಶಸ್ವಿ ವಹಿವಾಟು ನೈಜ-ಪ್ರಪಂಚದ ಇಂಗಾಲದ ಆಫ್‌ಸೆಟ್ ಅಂದಾಜುಗಳಿಗೆ ನೇರವಾಗಿ ಸಂಬಂಧ ಹೊಂದಿದೆ.' },
  feat_2_tag: { en: 'CIRCULARITY', hi: 'गोलकारिता', kn: 'ಗೋಲಾಕಾರತೆ' },
  feat_2_stats: { en: 'Instant Eco-Savings', hi: 'त्वरित इको-बचत', kn: 'ತ್ವರಿತ ಪರಿಸರ-ಉಳಿತಾಯ' },
  feat_3_title: { en: 'Membership Rewards', hi: 'सदस्यता पुरस्कार', kn: 'ಸದಸ್ಯತ್ವದ ಗಿಫ್ಟ್ ಗಳು' },
  feat_3_desc: { en: 'Earn points for sustainable actions. Level up from Bronze to Gold to unlock early access, shipping discounts, and exclusive drops.', hi: 'टिकाऊ कार्यों के लिए अंक कमाएं। कांस्य से स्वर्ण तक स्तर बढ़ाएं ताकि आप शुरुआती पहुंच, शिपिंग छूट और विशेष ड्रॉप्स को अनलॉक कर सकें।', kn: 'ಸುಸ್ಥಿರ ಕ್ರಿಯೆಗಳಿಗಾಗಿ ಅಂಕಗಳನ್ನು ಗಳಿಸಿ. ಬ್ರಾಂಜ್‌ನಿಂದ ಗೋಲ್ಡ್‌ಗೆ ಲೆವೆಲ್ ಅಪ್ ಮಾಡಿ ಮುಂಚಿನ ಪ್ರವೇಶ, ಶಿಪ್ಪಿಂಗ್ ರಿಯಾಯಿತಿಗಳು ಮತ್ತು ವಿಶೇಷ ಡ್ರಾಪ್‌ಗಳನ್ನು ಅನ್‌ಲಾಕ್ ಮಾಡಿ.' },
  feat_3_tag: { en: 'GAMIFICATION', hi: 'गेमिफिकेशन', kn: 'ಗ್ಯಾಮಿಫಿಕೇಶನ್' },
  feat_3_stats: { en: 'Real-World ROI', hi: 'वास्तविक जीवन में ROI', kn: 'ನೈಜ-ಪ್ರಪಂಚದಲ್ಲಿ ROI' },

  // CTA Section
  cta_badge: { en: 'The Future is Circular', hi: 'भविष्य सर्कुलर है', kn: 'ಭವಿಷ್ಯವು ವೃತ್ತಾಕಾರವಾಗಿದೆ' },
  cta_title1: { en: 'Stop Wasting.', hi: 'बर्बाद करना बंद करो।', kn: 'ವ್ಯರ್ಥ ಮಾಡುವುದನ್ನು ನಿಲ್ಲಿಸಿ.' },
  cta_title2: { en: 'Start Earning.', hi: 'कमाना शुरू करो।', kn: 'ಗಡಿಯಲು ಪ್ರಾರಂಭಿಸಿ.' },
  cta_desc: { en: 'Join thousands of forward-thinking consumers turning their eco-friendly choices into verifiable real-world value.', hi: 'हजारों प्रगतिशील उपभोक्ताओं से जुड़ें जो अपनी पर्यावरण अनुकूल पसंद को वास्तविक दुनिया के मूल्य में बदल रहे हैं।', kn: 'ತಮ್ಮ ಪರಿಸರ ಸ್ನೇಹಿ ಆಯ್ಕೆಗಳನ್ನು ನೈಜ-ಪ್ರಪಂಚದ ಮೌಲ್ಯವಾಗಿ ಪರಿವರ್ತಿಸುತ್ತಿರುವ ಸಾವಿರಾರು ಪ್ರಗತಿಪರ ಗ್ರಾಹಕರುಗೆ ಸೇರಿ.' },
  cta_btn1: { en: 'Join the Circular Economy', hi: 'सर्कुलर अर्थव्यवस्था से जुड़ें', kn: 'ಸರ್ಕ್ಯುಲರ್ ಎಕಾನಮಿಗೆ ಸೇರಿ' },
  cta_btn2: { en: 'Browse Marketplace', hi: 'बाज़ार ब्राउज़ करें', kn: 'ಮಾರುಕಟ್ಟೆಯನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ' },
  cta_trust1: { en: 'Verified Impact', hi: 'सत्यापित प्रभाव', kn: 'ಪರಿಶೀಲಿಸಿದ ಪ್ರಭಾವ' },
  cta_trust2: { en: 'Secure Blockchain', hi: 'सुरक्षित ब्लॉकचेन', kn: 'ಸುರಕ್ಷಿತ ಬ್ಲಾಕ್‌ಚೈನ್' },
  cta_trust3: { en: 'Premium Rewards', hi: 'प्रीमियम पुरस्कार', kn: 'ಪ್ರೀಮಿಯಂ ಬಹುಮಾನಗಳು' },

  // Navigation
  nav_home: { en: 'Home', hi: 'होम', kn: 'ಮನೆ' },
  nav_market: { en: 'Marketplace', hi: 'बाज़ार', kn: 'ಮಾರುಕಟ್ಟೆ' },
  nav_dash: { en: 'Dashboard', hi: 'डैशबोर्ड', kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' },
  nav_list: { en: 'List Item', hi: 'सूची आइटम', kn: 'ಪಟ್ಟಿ ಐಟಂ' },
  
  // Dashboard Tabs
  tab_overview: { en: 'overview', hi: 'अवलोकन', kn: 'ಅವಲೋಕನ' },
  tab_buy: { en: 'buy', hi: 'खरीदें', kn: 'ಖರೀದಿಸಿ' },
  tab_sell: { en: 'sell', hi: 'बेचें', kn: 'ಮಾರಿ' },
  tab_membership: { en: 'membership', hi: 'सदस्यता', kn: 'ಸದಸ್ಯತ್ವ' },
  
  // Dashboard Core
  dash_welcome: { en: 'Welcome', hi: 'स्वागत है', kn: 'ಸ್ವಾಗತ' },
  dash_signout: { en: 'Sign Out', hi: 'साइन आउट', kn: 'ಸೈನ್ ಔಟ್' },
  
  // Memberships
  mem_title: { en: 'Reuse_mart Memberships', hi: 'Reuse_mart सदस्यताएँ', kn: 'Reuse_mart ಸದಸ್ಯತ್ವಗಳು' },
  mem_subtitle: { en: 'Track carbon savings and earn tiers.', hi: 'कार्बन बचत ट्रैक करें और टियर कमाएं।', kn: 'ಕಾರ್ಬನ್ ಉಳಿತಾಯವನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.' },
  mem_current: { en: 'Current Tier', hi: 'वर्तमान स्तर', kn: 'ಪ್ರಸ್ತುತ ಹಂತ' },
  mem_upgrade: { en: 'Upgrade Available', hi: 'अपग्रेड उपलब्ध', kn: 'ಅಪ್‌ಗ್ರೇಡ್ ಲಭ್ಯವಿದೆ' },
  mem_active: { en: 'Active', hi: 'सक्रिय', kn: 'ಸಕ್ರಿಯ' },
  
  // Buttons
  btn_add_cart: { en: 'Add to Cart', hi: 'कार्ट में डालें', kn: 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ' },
  btn_buy_now: { en: 'Buy Now', hi: 'अभी खरीदें', kn: 'ಈಗ ಖರೀದಿಸಿ' },
  btn_checkout: { en: 'Proceed to Checkout', hi: 'चेकआउट के लिए आगे बढ़ें', kn: 'ಚೆಕ್ಔಟ್ಗೆ ಮುಂದುವರಿಯಿರಿ' }
};

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (k, f) => f || k,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>('en');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('reuse_mart_lang');
    if (saved && ['en', 'hi', 'kn'].includes(saved)) {
      setLang(saved as Language);
    }
    setIsMounted(true);
  }, []);

  const changeLang = (l: Language) => {
    setLang(l);
    localStorage.setItem('reuse_mart_lang', l);
  };

  const t = (key: string, fallback?: string) => {
    if (dict[key]) {
      return dict[key][lang];
    }
    return fallback || key; // Return fallback or the key itself
  };

  // Prevent server hydration mismatch on textual rendering by waiting
  if (!isMounted) return <>{children}</>;

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
