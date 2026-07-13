"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { chat, getToken } from "@/lib/api";

export default function IaPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Le textarea grandit avec le contenu, jusqu'à une hauteur max.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);
    try {
      const response = await chat(userMessage);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Désolé, une erreur est survenue. Veuillez réessayer." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex w-full flex-col h-[85vh] max-w-3xl mx-auto px-4">
      {/* Zone messages */}
      <div className="flex-1 w-full overflow-y-auto py-10 flex flex-col gap-8">
        {isEmpty && !loading ? (
          <div className="flex-1 w-full flex flex-col items-center justify-center text-center gap-2">
            <p className="text-lg text-gray-800">
              Bonjour ! Je suis <span className="font-semibold text-blue-900">AERIS</span>, votre
              assistant pour la qualité de l'air au Sénégal.
            </p>
            <p className="text-sm text-gray-500">
              Posez une question sur les zones, les particules ou les niveaux d'alerte pour commencer.
            </p>
          </div>
        ) : (
          messages.map((msg, i) =>
            msg.role === "user" ? (
              <div key={i} className="flex w-full justify-end">
                <p className="max-w-[80%] text-sm text-white bg-blue-900 rounded-2xl rounded-br-sm px-4 py-2.5 whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>
            ) : (
              <p
                key={i}
                className="text-[15px] leading-relaxed text-gray-800 whitespace-pre-wrap"
              >
                {msg.content}
              </p>
            )
          )
        )}
        {loading && (
          <p className="text-[15px] text-gray-400 animate-pulse">AERIS réfléchit…</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Zone saisie */}
      <div className="w-full pb-8">
        <div className="flex w-full items-end gap-2 rounded-3xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question à AERIS..."
            rows={1}
            className="flex-1 resize-none border-0 bg-transparent py-1.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            aria-label="Envoyer"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-900 text-white transition hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
