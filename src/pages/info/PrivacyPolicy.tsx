import { SimplePageTemplate } from "@/components/layout/SimplePageTemplate";

export default function PrivacyPolicy() {
    return (
        <SimplePageTemplate
            title="Privacy Policy"
            subtitle="How we handle your information securely."
            sections={[
                {
                    title: "Information Collection",
                    content: "We collect only the minimum necessary information required to verify your eligibility for a given election. This typically includes a unique identifier and essential contact information for authentication purposes."
                },
                {
                    title: "Anonymization of Ballots",
                    content: "Your voting choices are immediately separated from your identity upon submission. The encrypted ballot data is stored independently from the voter registry, ensuring your choices remain permanently private."
                },
                {
                    title: "Third-Party Disclosure",
                    content: "We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. Authorized election auditors receive only mathematical proofs and aggregate data, never individual voter profiles."
                },
                {
                    title: "Data Retention",
                    content: "Personally identifying information required for session authentication is aggressively purged in accordance with standard data minimization policies. Only the anonymized, encrypted voting ledger is retained for historical auditing purposes."
                },
                {
                    title: "Your Privacy Rights",
                    content: "Depending on your jurisdiction, you may have the right to request information about the demographic data collected during registration. However, due to the cryptographic nature of the system, it is impossible for us (or anyone else) to associate your identity with specific ballot choices."
                }
            ]}
        />
    );
}
