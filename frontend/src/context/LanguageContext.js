import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
    US: {
        home: 'HOME',
        shop_all: 'SHOP ALL',
        lip_tints: 'LIP TINTS',
        perfumes: 'PERFUMES',
        beauty_soaps: 'BEAUTY SOAPS',
        about: 'About',
        contact: 'Contact',
        free_shipping: 'Free Shipping for orders over ₱500',
        best_sellers: 'BEST SELLERS',
        featured: 'Featured',
        follow_fb: 'Follow us on Facebook',
        need_help: 'Need Help?',
        check_help: 'Check Out Our Products',
        footer_text: 'AmaraCé Skin Care - Luxury beauty & self-care essentials curated to enhance your natural radiance.',
        go_shop: 'Go to Shop',
        shipping_returns: 'Shipping & Returns',
        terms_conditions: 'Terms & Conditions',
        payment_methods: 'Payment Methods',
        faq: 'FAQ',
        we_accept: 'We accept the following paying methods',
    },
    JP: {
        home: 'ホーム',
        shop_all: 'すべて見る',
        lip_tints: 'リップティント',
        perfumes: '香水',
        beauty_soaps: '美容石鹸',
        about: '会社概要',
        contact: 'お問い合わせ',
        free_shipping: '₱500以上のお買い上げで送料無料',
        best_sellers: 'ベストセラー',
        featured: '注目の商品',
        follow_fb: 'Facebookをフォロー',
        need_help: 'お困りですか？',
        check_help: '私たちの製品をチェック',
        footer_text: 'AmaraCé スキンケア - あなたの自然な輝きを高めるために厳選された、贅沢な美容とセルフケアの必需品。',
        go_shop: 'ショップへ',
        shipping_returns: '配送と返品',
        terms_conditions: '利用規約',
        payment_methods: 'お支払い方法',
        faq: 'よくある質問',
        we_accept: '以下のお支払い方法がご利用いただけます',
    }
};

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(localStorage.getItem('lang') || 'US');

    useEffect(() => {
        localStorage.setItem('lang', lang);
    }, [lang]);

    const t = (key) => {
        return translations[lang][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
