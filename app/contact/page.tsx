// app/contact/page.tsx
export default function ContactPage() {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-6 text-center">Contact Us</h1>
        <div className="grid grid-cols-1 md:grid-cols-6 ...">
            <img
                src="images/trainlady-paint-01.svg"
                alt="Train Lady"
                className="h-96"
            />
        </div>
      </div>
    );
  }