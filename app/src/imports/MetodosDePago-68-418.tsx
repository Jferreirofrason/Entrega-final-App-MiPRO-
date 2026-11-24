import imgImage144 from "../assets/895cf661405c840396c3950c5965bf6b4bd8faa6.png";

function PaymentMethodIcon() {
  return (
    <div className="-translate-x-1/2 absolute bg-white border border-[#f2f4f7] border-solid h-[32px] left-1/2 rounded-[6px] top-0 w-[46px]" data-name="Payment method icon">
      <div className="absolute h-[17px] left-[6.2px] top-[6px] w-[30.6px]" data-name="image 144">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[328.47%] left-[-35.98%] max-w-none top-[-116.06%] w-[319.67%]" src={imgImage144} />
        </div>
      </div>
    </div>
  );
}

export default function MetodosDePago() {
  return (
    <div className="relative size-full" data-name="Métodos de Pago">
      <PaymentMethodIcon />
    </div>
  );
}