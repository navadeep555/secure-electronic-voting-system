import { SimplePageTemplate } from "@/components/layout/SimplePageTemplate";

export default function TermsOfService() {
    return (
        <SimplePageTemplate
            title="Terms of Service"
            subtitle="Rules governing the use of the SecureVote platform."
            sections={[
                {
                    title: "Usage Agreement",
                    content: "By accessing this platform, you agree to use it exclusively for authorized voting and electoral observation purposes. Any attempt to undermine the security, integrity, or availability of the system will result in immediate suspension of access."
                },
                {
                    title: "Authentication Integrity",
                    content: "Users are responsible for maintaining the confidentiality of their authentication credentials. You agree to notify administrators immediately of any unauthorized use of your secure token or account."
                },
                {
                    title: "Research Prototype Disclaimer",
                    content: "This application is provided as a demonstration of cryptographic voting concepts. While all security measures simulate a production-grade system, it is intended for research and evaluation purposes."
                }
            ]}
        />
    );
}
