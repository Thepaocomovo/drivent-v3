import { ApplicationError } from "@/protocols";

export function paymentRequiredError(): ApplicationError {
  return {
    name: "PaymentRequired",
    message: "You should have paid first!",
  };
}
