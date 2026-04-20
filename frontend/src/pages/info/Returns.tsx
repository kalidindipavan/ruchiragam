import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { RefreshCcw, AlertTriangle, ShieldAlert, Send } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../lib/apiClient';

type IssueType = 'damaged' | 'wrong_item' | 'quality_issue' | 'other';

export default function Returns() {
  const user = useAuthStore((state) => state.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    order_reference: '',
    issue_type: 'damaged' as IssueType,
    description: '',
    evidence_urls: '',
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      contact_name: prev.contact_name || user?.full_name || '',
      contact_email: prev.contact_email || user?.email || '',
      contact_phone: prev.contact_phone || user?.phone || '',
    }));
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.description.trim().length < 15) {
      toast.error('Please add a few more details so we can resolve this quickly.');
      return;
    }

    const evidence = form.evidence_urls
      .split(/\n|,/g)
      .map((url) => url.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      await apiClient.post('/returns/claims', {
        contact_name: form.contact_name.trim(),
        contact_email: form.contact_email.trim(),
        contact_phone: form.contact_phone.trim() || undefined,
        order_reference: form.order_reference.trim(),
        issue_type: form.issue_type,
        description: form.description.trim(),
        evidence_urls: evidence,
      });

      toast.success('Claim submitted successfully. Our team will review it shortly.');
      setForm((prev) => ({
        ...prev,
        order_reference: '',
        issue_type: 'damaged',
        description: '',
        evidence_urls: '',
      }));
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Unable to submit claim right now. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="mb-12">
        <h1 className="text-5xl font-display font-bold text-[var(--saffron-500)] mb-4">Returns & Replacements</h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-3xl">
          Because we sell perishable, hand-crafted food items, maintaining strict hygiene standards is mandatory. 
        </p>
      </div>

      <Card className="border-red-500/20 bg-red-500/5 mb-12">
        <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
          <div className="h-16 w-16 shrink-0 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-400 mb-2">No Traditional Returns Accepted</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              To ensure the absolute safety and hygiene of our community, <strong>we cannot physically accept returns of any food products</strong> once they have been delivered. Even if the jars are entirely unopened, standard safety protocols prohibit us from restocking or reselling dispatched perishables.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="prose prose-invert max-w-none prose-p:text-[var(--text-secondary)] prose-h2:text-[var(--text-primary)]">
        <h2 className="text-3xl font-display font-bold mb-6 text-[var(--saffron-400)]">Guaranteed Replacements</h2>
        <p className="text-lg mb-8">
          While we don't take physical jars back, your satisfaction is fundamentally guaranteed. Issues with courier mishandling or human packing errors will always be rectified instantly on us. 
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6">
            <AlertTriangle className="h-8 w-8 text-[var(--turmeric-400)] mb-4" />
            <h3 className="text-xl font-bold mb-2 text-white">Damaged or Broken Items</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              If your glass jar shattered during transit, or leaked an unacceptable amount of oil destroying the packaging, please take 2-3 clear photographs of the unboxing. Send them to support within 48 hours of delivery for a free, no-questions-asked replacement order.
            </p>
          </div>
          
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6">
            <RefreshCcw className="h-8 w-8 text-[var(--saffron-500)] mb-4" />
            <h3 className="text-xl font-bold mb-2 text-white">Incorrect Jars Sent</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Ordered Avakaya but received Gongura? Our kitchen made an error. Send us a quick photo of the incorrect labeling within 48 hours. We will immediately dispatch the correct jar, and you can keep or gift the initial incorrect jar on us.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-display font-bold mb-4">Flavor Preferences</h2>
        <p className="mb-4">
          Because spice thresholds and native flavor pallets are highly subjective across different Indian regions, we do not issue refunds if a pickle simply is "too spicy" or "not your style." We strongly recommend testing the smaller 250g jars before committing to bulk purchases if you are new to traditional Telugu spice levels!
        </p>

        <h2 className="text-2xl font-display font-bold mb-4 mt-8">How to start a claim?</h2>
        <p className="mb-4">
          Send an email to <strong>ruchiragamsupport@gmail.com</strong> and be sure to include:
        </p>
        <ul className="text-[var(--text-secondary)] space-y-2 mb-8 list-disc pl-5">
          <li>Your Full Name and Order Number (e.g. #ORDER-123)</li>
          <li>A clear description of the issue</li>
          <li>Supporting photographic evidence of the damaged shipping box / jar</li>
        </ul>
        <p>Our kitchen management team will review the claim and initiate a rapid-replacement dispatch within 12 business hours.</p>
      </div>

      <Card className="mt-12 border-[var(--border-subtle)] bg-[var(--bg-card)]">
        <CardContent className="p-6 sm:p-8">
          <h2 className="text-2xl font-display font-bold text-[var(--saffron-400)] mb-2">Submit Claim Online</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Share the issue details below and our support team will review your claim.
          </p>

          {!user && (
            <p className="mb-6 rounded-md border border-[var(--saffron-500)]/30 bg-[var(--saffron-500)]/10 px-4 py-3 text-sm text-[var(--text-secondary)]">
              Tip: If you are logged in, we auto-fill your contact details for faster submission.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)]">Full Name</label>
                <Input
                  required
                  value={form.contact_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, contact_name: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)]">Email</label>
                <Input
                  required
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setForm((prev) => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)]">Phone (Optional)</label>
                <Input
                  value={form.contact_phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)]">Order Reference</label>
                <Input
                  required
                  value={form.order_reference}
                  onChange={(e) => setForm((prev) => ({ ...prev, order_reference: e.target.value }))}
                  placeholder="#ORDER-123 or order ID"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[var(--text-secondary)]">Issue Type</label>
              <select
                required
                value={form.issue_type}
                onChange={(e) => setForm((prev) => ({ ...prev, issue_type: e.target.value as IssueType }))}
                className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)]"
              >
                <option value="damaged">Damaged / Broken Jar</option>
                <option value="wrong_item">Wrong Item Delivered</option>
                <option value="quality_issue">Quality Issue</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[var(--text-secondary)]">Description</label>
              <textarea
                required
                minLength={15}
                rows={5}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Please describe what happened so we can resolve it quickly."
                className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron-500)] resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[var(--text-secondary)]">Photo Links (Optional)</label>
              <textarea
                rows={3}
                value={form.evidence_urls}
                onChange={(e) => setForm((prev) => ({ ...prev, evidence_urls: e.target.value }))}
                placeholder="Paste photo URLs, separated by commas or new lines"
                className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron-500)] resize-none"
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Submit Claim <Send className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
