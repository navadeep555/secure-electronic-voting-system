import { SimplePageTemplate } from "@/components/layout/SimplePageTemplate";

export default function DataProtection() {
    return (
        <SimplePageTemplate
            title="Data Protection Framework"
            subtitle="Ensuring compliance and maximum data security."
            sections={[
                {
                    title: "Infrastructure Security",
                    content: "Our infrastructure relies on defense-in-depth principles, utilizing isolated network segments, rigid firewall policies, and constant integrity monitoring to protect voter registries and ballot payloads."
                },
                {
                    title: "Data Minimization",
                    content: "Following global privacy standards, we apply strict data minimization policies. Temporary data used during the validation phase is aggressively purged immediately after successful ballot casting."
                },
                {
                    title: "Transparency & Auditing",
                    content: "We implement verifiable logs for all administrative actions. These logs are maintained indefinitely to provide irrefutable proof of system governance without exposing voter PII."
                },
                {
                    title: "Incident Response",
                    content: "In the highly unlikely event of a suspected data breach, our automated protocols immediately isolate affected sub-systems. An independent forensic audit is mandated before normal operations can resume."
                },
                {
                    title: "Regulatory Compliance",
                    content: "The SecureVote framework is designed to align with strict international data protection standards, including foundational principles found in frameworks like GDPR and localized election security mandates."
                }
            ]}
        />
    );
}
