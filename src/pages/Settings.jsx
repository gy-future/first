
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, Languages } from 'lucide-react';
import { t, getCurrentLanguage, setLanguage } from '@/components/i18n';

export default function Settings() {
  const navigate = useNavigate();
  const currentLang = getCurrentLanguage();
  
  const languages = [
    { code: 'zh', name: t('language.chinese'), nativeName: '中文' },
    { code: 'en', name: t('language.english'), nativeName: 'English' }
  ];

  const handleLanguageChange = (langCode) => {
    if (currentLang !== langCode) {
      setLanguage(langCode);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 pt-8 pb-6 px-6">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-white text-xl font-bold">{t('settings.title')}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-2 max-w-sm mx-auto pb-8 space-y-4">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Languages className="w-5 h-5 text-blue-600" />
              {t('language.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant="ghost"
                className={`w-full justify-between p-4 h-auto text-base ${
                  currentLang === lang.code ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'
                }`}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <span>{lang.nativeName}</span>
                {currentLang === lang.code && <Check className="w-5 h-5" />}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
