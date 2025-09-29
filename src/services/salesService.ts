import axiosInstance from "./axiosConfig";

// FUNÇÃO ATUALIZADA
export const fetchSalesByProduct = async (startDate: string, endDate: string): Promise<any[]> => {
  try {
    // Adicionado o objeto 'params' para enviar as datas à API
    const response = await axiosInstance.get("/sales-by-product/", {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados de vendas por produto", error);
    return [];
  }
};

// FUNÇÃO ATUALIZADA
export const fetchSalesByClient = async (startDate: string, endDate: string): Promise<any[]> => {
  try {
    // Adicionado o objeto 'params' para enviar as datas à API
    const response = await axiosInstance.get("/sales-by-client/", {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados de vendas por cliente", error);
    return [];
  }
};


export const fetchSalesOverview = async (): Promise<any[]> => {
  try {
    const response = await axiosInstance.get("/sales-overview/");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados de visão geral das vendas", error);
    return [];
  }
};


export const fetchSalesConversion = async (): Promise<any[]> => {
  try {
    const response = await axiosInstance.get("/sales-conversion/");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados de conversão de vendas", error);
    return [];
  }
};


export const fetchSalesByPeriod = async (startDate: string, endDate: string): Promise<any[]> => {
  try {
    const response = await axiosInstance.get("/sales-by-period/", {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados de vendas por período", error);
    return [];
  }
};


export const fetchSalesByPaymentStatus = async (): Promise<any[]> => {
  try {
    const response = await axiosInstance.get("/sales-by-payment-status/");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados de vendas por status de pagamento", error);
    return [];
  }
};


export const fetchSalesAverageTicket = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get("/sales-average-ticket/");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados de média do ticket de vendas", error);
    return { average_ticket: 0 };
  }
};


export const fetchProducts = async (): Promise<{ value: string; label: string }[]> => {
  try {
    const response = await axiosInstance.get("/products/");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados de produtos", error);
    return [];
  }
};