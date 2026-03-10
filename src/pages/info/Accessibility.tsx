import { SimplePageTemplate } from "@/components/layout/SimplePageTemplate";

export default function AccessibilityInfo() {
    return (
        <SimplePageTemplate
            title="Accessibility Commitment"
            subtitle="Ensuring every eligible voter can participate securely and privately."
            sections={[
                {
                    title: "Inclusive Design Framework",
                    content: "The SecureVote platform is built following the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. We believe that a truly democratic system must be universally accessible."
                },
                {
                    title: "Assistive Technology Support",
                    content: "Our voting interface is fully compatible with modern screen readers, braille displays, and keyboard-only navigation. Contrast ratios and typography have been carefully selected to accommodate users with low vision."
                },
                {
                    title: "Continuous Improvement",
                    content: "We regularly test our platform with diverse groups of users. If you encounter any barriers while using our system, please contact our support team so we can address the issue promptly."
                }
            ]}
        />
    );
}
