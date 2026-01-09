import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchResult } from "../api/interview.api";
import { clearAuth, getAccessToken } from "../utils/api.utils";

interface Result {
    _id: string;
    fileName: string;
    resumeId: string;
    createdAt: string;
    updatedAt: string;
    totalScore: string;
    exitConfirmed: Boolean;
}

const ITEMS_PER_PAGE = 5;

const Result: React.FC = () => {
    const [results, setResults] = useState<Result[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const fetchedRef = useRef(false);
    const navigate = useNavigate();

    const fetchResults = async () => {
        const resumeId = localStorage.getItem("resumeId");
        const data = await fetchResult(resumeId);
        setResults(data.data || []);
    };

    const scoreNumber = (score: string) => Number(score);
    const getStatus = (score: string, status: Boolean) => scoreNumber(score) >= 5 ? "PASSED" : (status == false) ? "PROCESSING" : "FAILED";
    const getBadgeClass = (score: string, status: Boolean) => scoreNumber(score) >= 5 ? "bg-success" : (status == false) ? "bg-success" : "bg-danger";

    const handleLogout = () => {
        clearAuth();
        localStorage.removeItem("resumeId");
        navigate("/");
    };

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchResults();
    }, []);

    useEffect(() => {
        document.title = "Interview Results";
        if (!getAccessToken()) navigate("/");
    }, [navigate]);

    /* ================= Pagination ================= */
    const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedResults = results.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const changePage = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    console.log(results);

    /* ================================================= */

    return (
        <div className="d-flex flex-column" style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>

            {/* ===== HEADER ===== */}
            <header className="py-3 shadow-sm mb-4">
                <div className="container d-flex justify-content-between align-items-center">
                    <h4 className="mb-0 d-flex align-items-center gap-2">
                        📄 Results
                    </h4>
                    <div>
                        <button className="btn btn-outline-primary btn-sm me-2" onClick={() => navigate('/upload')}><i className="fa fa-cloud-upload"></i> Upload Resume</button>
                        <button className="btn btn-outline-primary btn-sm me-2" onClick={() => navigate('/result')}><i className="fa fa-file"></i> Results</button>
                        <button className="btn btn-outline-primary btn-sm" onClick={handleLogout}><i className="fa fa-arrow-left"></i> Logout</button>
                    </div>
                </div>
            </header>

            {/* Table */}
            <main className="pt-3 pb-5">
                <div className="row d-flex justify-content-center align-items-start mt-4">
                    <div className="col-8">
                        {/* <div className="card shadow-lg border-0 rounded-4">
                            <div className="card-body p-0"> */}
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Resume</th>
                                    <th>Score</th>
                                    <th>Created</th>
                                    <th>Updated</th>
                                    <th>Status</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedResults.map((item, index) => {
                                    const score = scoreNumber(item.totalScore) * 10;

                                    return (
                                        <tr key={item._id}>
                                            <td>{startIndex + index + 1}</td>
                                            <td className="fw-semibold">{item.fileName}</td>

                                            <td>
                                                <div className="fw-bold">{item.totalScore} / 10</div>
                                                <div className="progress" style={{ height: "6px" }}>
                                                    <div
                                                        className={`progress-bar ${score >= 50 ? "bg-success" : "bg-danger"
                                                            }`}
                                                        style={{ width: `${score}%` }}
                                                    />
                                                </div>
                                            </td>

                                            <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                            <td>{new Date(item.updatedAt).toLocaleDateString()}</td>

                                            <td>
                                                <span className={`badge px-3 py-2 ${getBadgeClass(item.totalScore, item.exitConfirmed)}`}>
                                                    {getStatus(item.totalScore, item.exitConfirmed)}
                                                </span>
                                            </td>

                                            <td className="text-center">
                                                <button
                                                    className="btn btn-sm btn-primary me-2"
                                                    onClick={() => {
                                                        console.log(item.resumeId);
                                                        localStorage.setItem('resumeId', item.resumeId);
                                                        console.log(localStorage.getItem('resumeId'));
                                                        navigate('/chat');
                                                    }}
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {results.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center text-muted py-5">
                                            No interview results found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {/* </div> */}

                        {/* Pagination Footer */}
                        {totalPages > 1 && (
                            <div className="card-footer bg-white d-flex justify-content-between align-items-center">
                                <small className="text-muted">
                                    Page {currentPage} of {totalPages}
                                </small>

                                <nav>
                                    <ul className="pagination mb-0">
                                        <li className={`page-item ${currentPage === 1 && "disabled"}`}>
                                            <button className="page-link" onClick={() => changePage(currentPage - 1)}>
                                                Previous
                                            </button>
                                        </li>

                                        {[...Array(totalPages)].map((_, i) => (
                                            <li
                                                key={i}
                                                className={`page-item ${currentPage === i + 1 && "active"}`}
                                            >
                                                <button className="page-link" onClick={() => changePage(i + 1)}>
                                                    {i + 1}
                                                </button>
                                            </li>
                                        ))}

                                        <li className={`page-item ${currentPage === totalPages && "disabled"}`}>
                                            <button className="page-link" onClick={() => changePage(currentPage + 1)}>
                                                Next
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        )}
                        {/* </div> */}
                    </div>
                </div>

            </main>

            {/* ===== FOOTER ===== */}
            <footer className="py-3 mt-auto bg-white shadow-sm text-center">
                <div className="container">
                    <small className="text-muted">© 2026 My App. All rights reserved.</small>
                </div>
            </footer>

        </div>
    );
};

export default Result;
