import { SimplePageTemplate } from "@/components/layout/SimplePageTemplate";

export default function CookiePolicy() {
    return (
        <SimplePageTemplate
            title="Cookie Policy"
            subtitle="Our strictly necessary use of browser storage."
            sections={[
                {
                    title: "Essential Session Management",
                    content: "The SecureVote platform uses strictly necessary cookies and local storage tokens to manage your secure session. These are required for the platform to function and cannot be switched off without disabling your ability to vote securely."
                },
                {
                    title: "No Tracking or Analytics",
                    content: "We do not use tracking cookies, cross-site analytics, or marketing scripts. Your browsing behavior is not monitored or recorded."
                },
                {
                    title: "Token Expiration",
                    content: "Authentication tokens stored in your browser are short-lived and automatically expire upon logging out or after a period of inactivity to ensure your session remains secure."
                }
            ]}
        />
    );
}
