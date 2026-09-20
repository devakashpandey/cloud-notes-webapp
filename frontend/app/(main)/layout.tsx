import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CreateNoteModal } from "@/components/notes/CreateNoteModal";
import { SocketListener } from '@/components/socket/SocketLisner';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <SocketListener />
      <Header />
      <div className="flex-1">{children}</div>
      <CreateNoteModal />
      <Footer />
    </div>
  );
}
