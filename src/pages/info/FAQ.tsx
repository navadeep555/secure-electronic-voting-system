import { SimplePageTemplate } from "@/components/layout/SimplePageTemplate";

export default function FAQ() {
    return (
        <SimplePageTemplate
            title="Frequently Asked Questions"
            subtitle="Find answers to common questions about using the platform."
            sections={[
                {
                    title: "How do I cast my vote?",
                    content: "Once you log in securely, you will be directed to your active election dashboard. Select the 'Vote' button next to the relevant election, make your candidate selection, review your choice, and submit to securely cast your ballot."
                },
                {
                    title: "Can I vote more than once?",
                    content: "No. The system generates a unique, one-time cryptographic token linked to your verified identity for each election. Once your vote is recorded on the tamper-proof ledger, your token is consumed, preventing any duplicate submissions."
                },
                {
                    title: "How do you guarantee my vote is anonymous?",
                    content: "Through advanced cryptographic masking, your identity is verified separately from your ballot. By the time your vote enters the secure counting module, it is statistically impossible to trace it back to your voter profile."
                },
                {
                    title: "Can I verify that my vote was counted?",
                    content: "Yes. After casting your ballot, you will receive a unique, anonymized digital receipt. Once the election concludes and results are published, you can use this receipt to independently verify your vote was included in the final tally without revealing your choice."
                },
                {
                    title: "What happens if I lose my internet connection while voting?",
                    content: "If your connection drops before submitting, your vote is not cast. You can log back in and restart the process. The system only records completed, cryptographically signed ballots."
                }
            ]}
        />
    );
}
