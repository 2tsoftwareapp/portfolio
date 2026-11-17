'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { uiStrings } from '@/lib/config';

// Zod validation schema
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export function ContactFormClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    // Rate limiting check
    const RATE_LIMIT_DURATION = 60 * 1000; // 60 seconds
    const lastSubmission = localStorage.getItem('lastContactSubmission');
    
    if (lastSubmission) {
      const timeSinceLastSubmission = Date.now() - parseInt(lastSubmission, 10);
      if (timeSinceLastSubmission < RATE_LIMIT_DURATION) {
        const remainingSeconds = Math.ceil((RATE_LIMIT_DURATION - timeSinceLastSubmission) / 1000);
        setSubmitStatus('error');
        setErrorMessage(`Please wait ${remainingSeconds} seconds before sending another message.`);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          message: data.message,
        }),
      });

      const payload = (await res.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!res.ok || !payload.success) {
        setSubmitStatus('error');
        setErrorMessage(
          typeof payload.error === 'string' && payload.error.length > 0
            ? payload.error
            : 'Failed to send message'
        );
        return;
      }

      // Store submission time
      localStorage.setItem('lastContactSubmission', Date.now().toString());

      setSubmitStatus('success');
      reset();

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } catch (error) {
      console.log(error);

      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl space-y-8"
      data-testid="contact-form"
    >
      {/* Name Field */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground font-mono">
          {uiStrings.contact.form.nameLabel}
        </label>
        <div className="relative group">
          <User aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            id="name"
            type="text"
            autoComplete="name"
            {...register('name')}
            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-mono text-sm"
            placeholder={uiStrings.contact.form.namePlaceholder}
            data-testid="contact-name-input"
          />
        </div>
        {errors.name && (
          <p
            className="mt-1 text-xs font-mono text-destructive uppercase tracking-tight flex items-center gap-1"
            data-testid="contact-name-error"
          >
            <AlertCircle aria-hidden="true" className="h-3 w-3" />
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground font-mono">
          {uiStrings.contact.form.emailLabel}
        </label>
        <div className="relative group">
          <Mail aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-mono text-sm"
            placeholder={uiStrings.contact.form.emailPlaceholder}
            data-testid="contact-email-input"
          />
        </div>
        {errors.email && (
          <p
            className="mt-1 text-xs font-mono text-destructive uppercase tracking-tight flex items-center gap-1"
            data-testid="contact-email-error"
          >
            <AlertCircle aria-hidden="true" className="h-3 w-3" />
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Message Field */}
      <div className="space-y-2">
        <label htmlFor="message" className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground font-mono">
          {uiStrings.contact.form.messageLabel}
        </label>
        <div className="relative group">
          <MessageSquare aria-hidden="true" className="absolute left-4 top-5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <textarea
            id="message"
            {...register('message')}
            rows={6}
            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors resize-none font-mono text-sm"
            placeholder={uiStrings.contact.form.messagePlaceholder}
            data-testid="contact-message-input"
          />
        </div>
        {errors.message && (
          <p
            className="mt-1 text-xs font-mono text-destructive uppercase tracking-tight flex items-center gap-1"
            data-testid="contact-message-error"
          >
            <AlertCircle aria-hidden="true" className="h-3 w-3" />
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-none font-bold font-mono text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        data-testid="contact-submit-button"
      >
        {isSubmitting ? (
          <>
            <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            {uiStrings.contact.form.submittingButton}
          </>
        ) : (
          <>
            <Send aria-hidden="true" className="h-4 w-4" />
            {uiStrings.contact.form.submitButton}
          </>
        )}
      </button>

      {/* Response Messages */}
      <div className="min-h-[4rem]" aria-live="polite">
        <AnimatePresence mode="wait">
          {submitStatus === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="p-4 bg-green-500/10 border border-green-500/30 rounded-none flex items-center gap-3 text-green-400"
              data-testid="contact-success-message"
            >
              <div className="p-1 bg-green-500/20 rounded-none">
                <CheckCircle aria-hidden="true" className="h-5 w-5 flex-shrink-0" />
              </div>
              <p className="font-mono text-xs sm:text-sm">
                {uiStrings.contact.messages.success}
              </p>
            </motion.div>
          ) : submitStatus === 'error' ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="p-4 bg-destructive/10 border border-destructive/30 rounded-none flex items-center gap-3 text-destructive"
              data-testid="contact-error-message"
            >
              <div className="p-1 bg-destructive/20 rounded-none">
                <AlertCircle aria-hidden="true" className="h-5 w-5 flex-shrink-0" />
              </div>
              <p className="font-mono text-xs sm:text-sm">
                {errorMessage || uiStrings.contact.messages.error}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </form>
  );
}
