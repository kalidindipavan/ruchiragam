import { Card, CardContent } from '../../components/ui/card';
import { Truck, MapPin, Clock, ShieldCheck } from 'lucide-react';

export default function ShippingPolicy() {
  const policies = [
    {
      icon: <MapPin className="h-6 w-6 text-[var(--saffron-500)]" />,
      title: "Delivery Zones",
      description: "We proudly ship Pan-India. Whether you reside in a bustling metro or a quiet town, our authentic homemade pickles will reach your doorstep."
    },
    {
      icon: <Clock className="h-6 w-6 text-[var(--saffron-500)]" />,
      title: "Processing Times",
      description: "Our recipes take time. Once your order is placed, please allow 1-2 business days for us to carefully fill, seal, and pack your jars. During peak festival seasons, processing may extend slightly."
    },
    {
      icon: <Truck className="h-6 w-6 text-[var(--saffron-500)]" />,
      title: "Transit & Delivery Speeds",
      description: "Standard shipping typically takes 3 to 6 business days depending on your zone. Remote areas may experience extended delivery times."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-[var(--saffron-500)]" />,
      title: "Secure Packaging",
      description: "Transporting oil-based pickles requires immense care. All our jars undergo a strict multi-layered leak-proofing process and are cushioned heavily to prevent transit agitation."
    }
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="mb-12">
        <h1 className="text-5xl font-display font-bold text-[var(--saffron-500)] mb-4">Shipping Policy</h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-3xl">
          At Ruchi Ragam, ensuring your homemade treats arrive fresh, safe, and leak-free is our highest priority.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {policies.map((policy, index) => (
          <Card key={index} className="border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--saffron-500)/30] transition-colors">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-full bg-[var(--saffron-500)/10] flex items-center justify-center mb-4">
                {policy.icon}
              </div>
              <h3 className="text-xl font-bold font-display text-[var(--text-primary)] mb-2">{policy.title}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">{policy.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="prose prose-invert max-w-none prose-p:text-[var(--text-secondary)] prose-h2:text-[var(--text-primary)]">
        <h2 className="text-2xl font-bold mb-4 font-display">Shipping Rates</h2>
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-6 mb-8">
          <ul className="space-y-4 my-0 text-[var(--text-secondary)]">
            <li className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[var(--saffron-500)]"></span>
              <strong>Complimentary Shipping:</strong> Entirely free on all orders over ₹500.
            </li>
            <li className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[var(--text-muted)]"></span>
              <strong>Standard Orders (under ₹500):</strong> A flat protective-packaging & shipping fee of ₹50 applies at checkout.
            </li>
          </ul>
        </div>

        <h2 className="text-2xl font-bold mb-4 font-display">Order Tracking</h2>
        <p className="mb-4">
          The moment your order is dispatched from our kitchen, you will receive an email containing a dedicated tracking tracking ID alongside the courier partner's details. You can also view real-time tracking from your personal <a href="/profile" className="text-[var(--saffron-400)] hover:underline">Profile Dashboard</a>.
        </p>

        <h2 className="text-2xl font-bold mb-4 font-display">Damages in Transit</h2>
        <p>
          While we boast an incredible success rate with our packaging, accidents in logistics happen. If you receive a jar that has leaked severely, cracked, or broken, please take a photograph immediately while it is still in the box. Head over to our <a href="/returns" className="text-[var(--saffron-400)] hover:underline">Returns & Replacements</a> policy for straightforward instructions on how to claim your rapid replacement!
        </p>
      </div>
    </div>
  );
}
