import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { HelpCircle, Truck, MessageSquare } from 'lucide-react';

export default function Support() {
  const navigate = useNavigate();

  const links = [
    {
      title: "Where is my order?",
      description: "Quickly track your shipment status.",
      icon: <Truck className="h-8 w-8 text-blue-400" />,
      path: "/profile",
      bgClass: "bg-blue-500/10 border-blue-500/20 hover:border-blue-500/50"
    },
    {
      title: "Frequently Asked Questions",
      description: "Answers about ingredients, shelf life, and processing times.",
      icon: <HelpCircle className="h-8 w-8 text-green-400" />,
      path: "/faq",
      bgClass: "bg-green-500/10 border-green-500/20 hover:border-green-500/50"
    },
    {
      title: "Contact the Kitchen",
      description: "Send us a direct message and we'll resolve any custom requirements.",
      icon: <MessageSquare className="h-8 w-8 text-[var(--saffron-500)]" />,
      path: "/contact",
      bgClass: "bg-[var(--saffron-500)]/10 border-[var(--saffron-500)]/20 hover:border-[var(--saffron-500)]/50"
    }
  ];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-display font-bold text-[var(--text-primary)] mb-4">How can we help you?</h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
          We pride ourselves on 5-star hospitality. Click on the topic below that best fits your issue.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {links.map((item, index) => (
          <Card 
            key={index} 
            onClick={() => navigate(item.path)}
            className={`cursor-pointer transition-all duration-300 ${item.bgClass}`}
          >
            <CardContent className="p-8 flex items-start gap-6">
              <div className="shrink-0 p-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl shadow-lg">
                {item.icon}
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-white mb-2">{item.title}</h2>
                <p className="text-[var(--text-secondary)] leading-relaxed">{item.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center border-t border-[var(--border-subtle)] pt-12">
        <p className="text-[var(--text-secondary)]">Need urgent business assistance?</p>
        <p className="font-bold text-[var(--text-primary)] mt-1">Call us directly at <span className="text-[var(--saffron-400)]">+91 98765 43210</span></p>
      </div>
    </div>
  );
}
