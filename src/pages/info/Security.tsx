import { SimplePageTemplate } from "@/components/layout/SimplePageTemplate";

export default function SecurityInfo() {
    return (
        <SimplePageTemplate
            title="Platform Security"
            subtitle="How we protect your data and ensure electoral integrity."
            sections={[
                {
                    title: "End-to-End Encryption",
                    content: "All interactions on the SecureVote platform are encrypted from your device to our secure ledger. We use modern cryptographic protocols to ensure that your selections remain completely private throughout the entire election process."
                },
                {
                    title: "Verifiable Integrity",
                    content: "Every cast ballot is recorded with a unique digital signature and timestamp. This creates an immutable audit trail that can be independently verified by authorized observers, ensuring the final tally is 100% accurate."
                },
                {
                    title: "Role-Based Access",
                    content: "Strict access controls govern the platform. Voters have access to their secure voting booth, administrators manage the timeline, and independent auditors can verify the mathematical proofs without ever seeing raw ballot data."
                },
                {
                    title: "Threat Resilience",
                    content: "Our infrastructure is designed with defense-in-depth principles to withstand various cyber threats, including DDoS attacks and unauthorized intrusion attempts. Real-time monitoring ensures the availability and integrity of the election at all times."
                }
            ]}
        />
    );
}
