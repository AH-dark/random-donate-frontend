import React, { useEffect } from "react";
import classes from "./style.module.scss";
import Layout from "components/Layout";
import { Container, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useParams } from "react-router-dom";
import { useGetDonateInfoQuery } from "services/api";
import { useTranslation } from "react-i18next";
import DonateCard from "components/DonateCard";
import clsx from "clsx";
import { useAppDispatch } from "redux/hooks";
import { setTitle } from "redux/reducer/viewUpdate";

const DonatePage: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const { id } = useParams<{ id: string }>();
    const { data } = useGetDonateInfoQuery(id);

    useEffect(() => {
        dispatch(setTitle(t("{{name}} 专属乞讨页", { ns: "title", name: data?.name })));
    }, [data, dispatch, t]);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    return (
        <Layout className={clsx("donatePage", classes.root)}>
            <Container maxWidth={"md"} className={classes.container}>
                <Typography
                    variant={isMobile ? "h4" : "h3"}
                    component={"h1"}
                    className={clsx("title", classes.title)}
                >
                    {t("快给 {{name}} 打钱！", {
                        name: data?.name,
                    })}
                </Typography>
                {data && <DonateCard data={data} className={classes.card} />}
            </Container>
        </Layout>
    );
};

export default DonatePage;
