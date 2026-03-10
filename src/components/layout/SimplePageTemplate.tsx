import React from "react";
import { PageWrapper } from "@/components/PageWrapper";
import { Layout } from "@/components/layout/Layout";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";

interface Section {
    title: string;
    content: string;
}

interface SimplePageTemplateProps {
    title: string;
    subtitle: string;
    sections: Section[];
}

export function SimplePageTemplate({ title, subtitle, sections }: SimplePageTemplateProps) {
    return (
        <PageWrapper>
            <Layout>
                <div className="bg-neutral-50 min-h-screen pt-24 pb-20">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mb-12 text-center"
                        >
                            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                                <Shield className="h-8 w-8 text-primary-700" />
                            </div>
                            <h1 className="text-4xl font-display font-bold text-neutral-900 mb-4">
                                {title}
                            </h1>
                            <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
                                {subtitle}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 md:p-12"
                        >
                            <div className="prose prose-neutral max-w-none">
                                {sections.map((section, index) => (
                                    <div key={index} className="mb-10 last:mb-0">
                                        <h2 className="text-2xl font-bold text-neutral-900 mb-4 border-b border-neutral-100 pb-2">
                                            {section.title}
                                        </h2>
                                        <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">
                                            {section.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </Layout>
        </PageWrapper>
    );
}
