import { Card, CardContent } from '../../components/ui/card';
import { RefreshCcw, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function Returns() {
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
    </div>
  );
}
