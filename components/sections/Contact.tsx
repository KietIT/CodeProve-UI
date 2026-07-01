"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Plus, Send } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";

const inputCls =
  "w-full rounded-pill border border-border bg-surface/60 px-4 py-2.5 text-sm text-content outline-none transition-colors placeholder:text-muted/50 focus:border-teal/60";

export function Contact() {
  const { t } = useI18n();
  const c = t.contact;
  const [open, setOpen] = useState<number | null>(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // No backend in the MVP - compose a prefilled email instead.
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[CodeProve] ${name}`);
    const body = encodeURIComponent(`${message}\n\n- ${name} (${email})`);
    window.location.href = `mailto:${c.email}?subject=${subject}&body=${body}`;
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden scroll-mt-24 py-20 sm:py-28"
    >
      <div
        className="section-aura -top-10 left-[-6%] h-[460px] w-[560px]"
        aria-hidden="true"
      />
      <div className="container-site grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left - contact form */}
        <Reveal>
          <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {c.title}
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
            {c.sub}
          </p>

          <a
            href={`mailto:${c.email}`}
            className="mt-6 inline-flex items-center gap-2 text-sm text-teal transition-colors hover:text-teal-300"
          >
            <Mail className="h-4 w-4" />
            {c.email}
          </a>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted">
                  {c.nameLabel}
                </span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={c.namePlaceholder}
                  className={inputCls}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted">
                  {c.emailLabel}
                </span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={c.emailPlaceholder}
                  className={inputCls}
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted">
                {c.messageLabel}
              </span>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={c.messagePlaceholder}
                className="w-full resize-none rounded-card border border-border bg-surface/60 px-4 py-3 text-sm text-content outline-none transition-colors placeholder:text-muted/50 focus:border-teal/60"
              />
            </label>
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              {c.send}
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Reveal>

        {/* Right - FAQ */}
        <Reveal>
          <h3 className="text-balance text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
            {c.faqTitle}
          </h3>
          <div className="mt-6 divide-y divide-border border-y border-border">
            {t.faq.items.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={item.q}>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="text-base font-medium text-content">{item.q}</span>
                    <span
                      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-teal transition-transform duration-300 ${
                        isOpen ? "rotate-45 bg-teal/10" : ""
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 pr-10 text-sm leading-relaxed text-muted">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
