import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactUs() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Your message has been safely delivered to our kitchen team. We will respond shortly!', { duration: 5000 });
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-display font-bold text-[var(--text-primary)] mb-4">Get in Touch</h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
          Have a question about an order, want to request a custom bulk batch, or just want to tell us how much you loved the Gongura? We are here.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Information */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
            <CardContent className="p-8 space-y-8">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 shrink-0 rounded-full bg-[var(--saffron-500)/10] flex items-center justify-center text-[var(--saffron-500)]">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Email Us</h3>
                  <p className="text-[var(--text-secondary)] mb-2 text-sm">Best for order issues and claims.</p>
                  <a href="mailto:support@ruchiragam.com" className="text-[var(--saffron-400)] hover:underline font-medium">support@ruchiragam.com</a>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t border-[var(--border-subtle)] pt-8">
                <div className="h-12 w-12 shrink-0 rounded-full bg-[var(--saffron-500)/10] flex items-center justify-center text-[var(--saffron-500)]">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Call the Kitchen</h3>
                  <p className="text-[var(--text-secondary)] mb-2 text-sm">Mon-Fri from 9am to 6pm IST.</p>
                  <a href="tel:+919876543210" className="text-[var(--saffron-400)] hover:underline font-medium">+91 98765 43210</a>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t border-[var(--border-subtle)] pt-8">
                <div className="h-12 w-12 shrink-0 rounded-full bg-[var(--saffron-500)/10] flex items-center justify-center text-[var(--saffron-500)]">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Kitchen HQ</h3>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                    123 Traditional Heritage Lane,<br/>
                    Guntur District, Andhra Pradesh<br/>
                    India 522002
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="h-6 w-6 text-[var(--saffron-500)]" />
                <h2 className="text-2xl font-display font-bold text-white">Send a Message</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Your Name <span className="text-red-500">*</span></label>
                    <Input required placeholder="Rahul Desai" className="bg-[var(--bg-primary)] border-[var(--border-subtle)]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Email Address <span className="text-red-500">*</span></label>
                    <Input required type="email" placeholder="rahul@example.com" className="bg-[var(--bg-primary)] border-[var(--border-subtle)]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Order Number (Optional)</label>
                  <Input placeholder="e.g. #ORDER-6789" className="bg-[var(--bg-primary)] border-[var(--border-subtle)]" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">How can we help? <span className="text-red-500">*</span></label>
                  <textarea 
                    required 
                    rows={6}
                    placeholder="Describe your issue or ask your question here..." 
                    className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--saffron-500)] resize-none"
                  ></textarea>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-[var(--saffron-600)] hover:bg-[var(--saffron-500)] text-white py-6"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Sending securely...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send Message <Send className="h-4 w-4" />
                    </span>
                  )}
                </Button>
                <p className="text-xs text-center text-[var(--text-muted)] mt-4">
                  By submitting this form, you acknowledge our Privacy Policy. We aim to respond within 24 hours.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
