import axios from "axios";
import {
  QueryClient,
  useMutation,
  useQuery,
  // useInfiniteQuery,
} from "@tanstack/react-query";

export let baseUrl = "http://localhost:3000/api";

if (process.env.NODE_ENV === "production") {
  baseUrl = process.env.NEXT_PUBLIC_API_URL as string;
}

export const userInfo = () => {
  return {
    userInfo:
      typeof window !== "undefined" && localStorage.getItem("userInfo")
        ? JSON.parse(
            typeof window !== "undefined" &&
              (localStorage.getItem("userInfo") as string | any)
          )
        : null,
  };
};

export const config = () => {
  return {
    headers: {
      Authorization: `Bearer ${userInfo().userInfo?.state?.userInfo?.token}`,
      "X-User-Id": userInfo().userInfo?.state?.userInfo?.id,
    },
  };
};

export const api = async (method: string, url: string, obj = { url }) => {
  // Extract the dynamic URL if provided, else fallback to the provided URL
  const finalUrl = obj.url ? `${baseUrl}/${obj.url}` : `${baseUrl}/${url}`;
  // Ensure the dynamic URL isn't sent as part of the request payload
  const { url: _, ...payload } = obj;
  try {
    switch (method) {
      case "GET":
        return await axios.get(finalUrl, config()).then((res) => res.data);

      case "POST":
        return await axios
          .post(finalUrl, obj, config())
          .then((res) => res.data);

      case "PUT":
        return await axios.put(finalUrl, obj, config()).then((res) => res.data);

      case "DELETE":
        return await axios.delete(finalUrl, config()).then((res) => res.data);
    }
  } catch (error: any) {
    const err = error?.response?.data?.error || "Something went wrong";
    const expectedErrors = ["invalid signature", "jwt expired"];
    if (expectedErrors.includes(err)) {
      localStorage.removeItem("userInfo");
      window.location.reload();
    }
    throw err;
  }
};

type Method = "GET" | "POST" | "PUT" | "DELETE" | "InfiniteScroll";

interface ApiHookParams {
  key: string[];
  method: Method;
  url: string;
  scrollMethod?: "GET";
}

export default function useApi({
  key,
  method,
  scrollMethod,
  url,
}: ApiHookParams) {
  const queryClient = new QueryClient();
  switch (method) {
    case "GET":
      // eslint-disable-next-line
      const GET = useQuery({
        queryKey: key,
        queryFn: () => api(method, url, { url }),
        retry: 0,
      });

      return { GET };

    case "POST":
      // eslint-disable-next-line
      const POST = useMutation({
        mutationFn: (obj: any) => api(method, url, obj),
        retry: 0,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: key });
        },
      });
      return { POST };

    case "PUT":
      // eslint-disable-next-line
      const PUT = useMutation({
        mutationFn: (obj: any) => api(method, `${url}/${obj?.id}`, obj),
        retry: 0,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
      });

      return { PUT };

    case "DELETE":
      // eslint-disable-next-line
      const DELETE = useMutation({
        mutationFn: (id: string) => api(method, `${url}/${id}`),
        retry: 0,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
      });
      return { DELETE };

    // case 'InfiniteScroll':
    //   // eslint-disable-next-line
    //   const infinite = useInfiniteQuery({
    //     queryKey: key,
    //     queryFn: ({ pageParam = 1 }) =>
    //       api(scrollMethod, `${url}&page=${pageParam}`),
    //     getNextPageParam: (lastPage: any, allPages) => {
    //       const maxPage = lastPage?.pages
    //       const nextPage = allPages?.length + 1

    //       return nextPage <= maxPage ? nextPage : undefined
    //     },
    //     retry: 0,
    //   })

    //   return { infinite, data: infinite.data }

    default:
      throw new Error(`Invalid method ${method}`);
  }
}
