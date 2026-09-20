'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useT } from '@/lib/i18n';
import {
  Mail,
  MapPin,
  Clock,
  Send,
  ArrowRight,
  MessageSquare,
  CircleCheck as CheckCircle2,
  CircleAlert as AlertCircle,
} from 'lucide-react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactClient() {
  const { t } = useT();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contactInfo = [
    {
      icon: Mail,
      title: t.contact.emailSupport,
      detail: 'hello@venehire.com',
      description: t.contact.emailResponseTime,
    },
    {
      icon: MapPin,
      title: t.contact.visitUs,
      detail: 'Remote-First',
      description: t.contact.locationText,
    },
    {
      icon: Clock,
      title: t.contact.callUs,
      detail: 'Within 24 hours',
      description: t.contact.callHours,
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!EMAIL_RE.test(formData.email.trim())) {
      setError(t.errors.invalidEmail);
      return;
    }

    setIsSubmitting(true);
    const res = await fetch('/api/contact-messages/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      }),
    });
    setIsSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || t.common.somethingWentWrong);
      return;
    }
    setIsSubmitted(true);
  };

  return (
    <>
      {/* Hero */}
      <section className="relative pt-24 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-teal-50/50 -z-10" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/40 to-teal-100/30 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-teal-100/30 to-blue-100/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(210,100%,45%)] bg-[hsl(210,100%,45%)]/10 rounded-full mb-6">
            {t.contact.heroBadge}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1] max-w-4xl mx-auto">
            {t.contact.heroTitle}{' '}
            <span className="gradient-text">VeneHire</span>
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {t.contact.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Left -- Contact Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {t.contact.sendMessageTitle}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.contact.heroSubtitle}
                </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="w-5 h-5 text-[hsl(210,100%,45%)]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-base font-medium text-foreground mt-0.5">
                        {item.detail}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-100">
                <p className="text-sm text-muted-foreground mb-4">
                  {t.contact.scheduleDemoTitle}
                </p>
                <Link href="/demo">
                  <Button
                    variant="outline"
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    {t.contact.tryDemoBtn} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right -- Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 p-8 lg:p-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-[hsl(210,100%,45%)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {t.contact.sendMessageTitle}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t.contact.emailResponseTime}
                    </p>
                  </div>
                </div>

                {isSubmitted ? (
                  <div className="flex flex-col items-center text-center py-10">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-1">
                      {t.contact.successTitle}
                    </h4>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      {t.contact.successSubtitle}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t.contact.fullNameLabel}</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder={t.contact.fullNamePlaceholder}
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t.contact.emailLabel}</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder={t.contact.emailPlaceholder}
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">{t.contact.subjectLabel}</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder={t.contact.subjectPlaceholder}
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">{t.contact.messageLabel}</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder={t.contact.messagePlaceholder}
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-[hsl(210,100%,45%)] to-[hsl(210,100%,38%)] hover:from-[hsl(210,100%,40%)] hover:to-[hsl(210,100%,33%)] text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all text-base h-12"
                    >
                      {isSubmitting ? (
                        t.contact.sendingBtn
                      ) : (
                        <>
                          {t.contact.sendBtn} <Send className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
