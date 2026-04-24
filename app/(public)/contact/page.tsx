'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Mail,
  MapPin,
  Clock,
  Send,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';

const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    detail: 'hello@venehire.com',
    description: 'We respond to all inquiries within 24 hours.',
  },
  {
    icon: MapPin,
    title: 'Our Location',
    detail: 'San Francisco, CA',
    description: 'Serving companies and engineers globally.',
  },
  {
    icon: Clock,
    title: 'Response Time',
    detail: 'Within 24 hours',
    description: 'Monday through Friday, 9am to 6pm PST.',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: integrate with backend / API
    console.log('Form submitted:', formData);
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
            Contact
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Get in{' '}
            <span className="gradient-text">Touch</span>
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Have a question about our platform, want to explore a partnership,
            or ready to hire production-ready engineers? We would love to hear
            from you.
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
                  Let&apos;s Start a Conversation
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Whether you are a company looking for top engineering talent or
                  an engineer looking for your next opportunity, we are here to
                  help.
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
                  Looking to request a demo instead?
                </p>
                <Link href="/request-demo">
                  <Button
                    variant="outline"
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    Request a Demo <ArrowRight className="w-4 h-4 ml-2" />
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
                      Send Us a Message
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Fill out the form and we will get back to you shortly.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@company.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="What is this regarding?"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us how we can help..."
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-[hsl(210,100%,45%)] to-[hsl(210,100%,38%)] hover:from-[hsl(210,100%,40%)] hover:to-[hsl(210,100%,33%)] text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all text-base h-12"
                  >
                    Send Message <Send className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
