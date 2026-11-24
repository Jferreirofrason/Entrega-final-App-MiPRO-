import imgBankLogo from "../assets/32d8caa0beed8d5a79da0d0bd886bc58875e9286.png";

function PaymentMethodIcon() {
  return (
    <div className="-translate-x-1/2 absolute bg-white border border-[#f2f4f7] border-solid h-[32px] left-1/2 rounded-[6px] top-0 w-[46px]" data-name="Payment method icon">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[17px] left-1/2 top-[calc(50%+0.5px)] w-[32px]" data-name="Bank Logo">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgBankLogo} />
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