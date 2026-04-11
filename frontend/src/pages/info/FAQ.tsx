import { Card, CardContent } from '../../components/ui/card';
import { HelpCircle } from 'lucide-react';

export default function FAQ() {
  const faqs = [
    {
      question: "Are your pickles and podis completely homemade?",
      answer: "Yes! Every single jar is crafted in small batches using traditional Andhra recipes passed down through generations. We source the freshest local ingredients and prepare everything by hand.",
    },
    {
      question: "Do you use any preservatives or artificial colors?",
      answer: "Absolutely not. We rely entirely on natural preservation methods—high-quality cold-pressed oils, pure ground spices, and sun-drying. No chemicals, additives, or artificial flavors are ever added.",
    },
    {
      question: "How long do the pickles stay fresh?",
      answer: "When stored correctly in a cool, dry place away from direct sunlight, our pickles have a shelf life of 6 to 9 months. Our podis will stay fresh and deeply aromatic for up to 6 months.",
    },
    {
      question: "Is it normal for a layer of oil to sit on top of the pickle?",
      answer: "Yes! This is completely normal and actually desired. A thin layer of oil acts as a natural barrier against air and moisture, preserving the pickle naturally. Just give it a good stir before serving.",
    },
    {
      question: "Do I need to refrigerate the jars once opened?",
      answer: "Refrigeration is entirely optional but highly recommended if you live in a very hot or humid climate. Otherwise, simply ensure you only use a clean, dry spoon every time to prevent moisture contamination.",
    },
    {
      question: "Are your products very spicy?",
      answer: "Authentic Telugu cuisine is known for its heat! While some pickles like Avakaya pack a powerful punch, others like our Bellam (Jaggery) variants or Kandi Podi are much milder. Check the individual product descriptions for a spice-level rating.",
    }
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="text-center mb-12">
        <div className="mx-auto h-16 w-16 mb-4 rounded-full bg-[var(--saffron-500)/10] flex items-center justify-center text-[var(--saffron-500)]">
          <HelpCircle className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-display font-bold text-[var(--text-primary)] mb-4">Frequently Asked Questions</h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
          Everything you need to know about our traditional preparation process, shelf life, and storage recommendations.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Card key={index} className="border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden transition-all hover:border-[var(--saffron-500)/30]">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold font-display text-[var(--saffron-400)] mb-2">{faq.question}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">{faq.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center p-8 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)]">
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Still have questions?</h3>
        <p className="text-[var(--text-secondary)] mb-6">Our family is always happy to help you pick the perfect jar.</p>
        <a href="/contact" className="inline-block bg-[var(--saffron-600)] hover:bg-[var(--saffron-500)] text-white px-6 py-3 rounded-md transition-colors font-medium">
          Contact Us
        </a>
      </div>
    </div>
  );
}
