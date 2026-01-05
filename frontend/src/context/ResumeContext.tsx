import { createContext, useContext, useState, ReactNode } from "react";

type ResumeContextType = {
    resumeId: string | null;
    setResumeId: (id: string | null) => void;
};

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const ResumeProvider = ({ children }: { children: ReactNode }) => {
    const [resumeId, setResumeId] = useState<string | null>(null);

    return (
        <ResumeContext.Provider value={{ resumeId, setResumeId }}>
            {children}
        </ResumeContext.Provider>
    );
};


export const useResume = () => {
    const ctx = useContext(ResumeContext);
    if (!ctx) throw new Error("useResume must be used inside ResumeProvider");
    return ctx;
};


